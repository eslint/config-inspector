import type { FSWatcher } from 'chokidar'
import type { DevframeScopedNodeContext } from 'devframe'
import type { ErrorInfo, Payload } from '../../shared/types'
import type { ReadConfigOptions } from '../configs'
import chokidar from 'chokidar'
import { defineRpcFunction } from 'devframe'
import { readConfig, resolveConfigPath } from '../configs'
import { MARK_CHECK } from '../constants'
import { ConfigInspectorError } from '../errors'

const readErrorWarning = `Failed to load \`eslint.config.js\`.
Note that \`@eslint/config-inspector\` only works with the flat config format:
https://eslint.org/docs/latest/use/configure/configuration-files-new`

let buildPayload: Payload | ErrorInfo | undefined

/**
 * Pre-load the build-time payload before calling createBuild —
 * createBuild does not forward CLI flags to setup(), so the build
 * wrapper stashes the result here and the inspector's setup reads it.
 */
export function setBuildPayload(payload: Payload | ErrorInfo): void {
  buildPayload = payload
}

export function registerGetPayload(
  ctx: DevframeScopedNodeContext<'eslint-config-inspector'>,
  readOptions: ReadConfigOptions,
): void {
  let payload: Payload | ErrorInfo | undefined
  let watcher: FSWatcher | undefined

  async function load(): Promise<Payload | ErrorInfo> {
    if (ctx.mode === 'build' && buildPayload !== undefined)
      return buildPayload

    try {
      const res = await readConfig(readOptions)

      if (ctx.mode === 'dev') {
        const { basePath } = await resolveConfigPath(readOptions)
        watcher ??= chokidar
          .watch([], { ignoreInitial: true, cwd: basePath })
          .on('change', (path) => {
            payload = undefined
            console.log()
            console.log(MARK_CHECK, 'Config change detected', path)
            ctx.rpc.broadcast({
              method: 'invalidate' as never,
              args: [path] as never,
            })
          })
        watcher.add(res.dependencies)
      }

      payload = res.payload
    }
    catch (e) {
      console.error(readErrorWarning)
      if (e instanceof ConfigInspectorError)
        e.prettyPrint()
      else
        console.error(e)
      payload = { message: readErrorWarning, error: String(e) }
    }
    return payload
  }

  ctx.rpc.register(defineRpcFunction({
    name: 'get-payload',
    type: 'query',
    snapshot: true,
    handler: async (): Promise<Payload | ErrorInfo> => payload ?? await load(),
  }))
}
