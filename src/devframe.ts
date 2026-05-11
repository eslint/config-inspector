import type { FSWatcher } from 'chokidar'
import type { ErrorInfo, Payload } from '../shared/types'
import type { ReadConfigOptions } from './configs'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import chokidar from 'chokidar'
import { defineRpcFunction } from 'devframe'
import { defineDevframe } from 'devframe/types'
import { readConfig, resolveConfigPath } from './configs'
import { MARK_CHECK } from './constants'
import { ConfigInspectorError } from './errors'

const distDir = fileURLToPath(new URL('../dist/public', import.meta.url))

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

export interface DevtoolFlags {
  config?: string
  files?: boolean
  basePath?: string
}

const devframe = defineDevframe({
  id: 'eslint-config-inspector',
  name: 'ESLint Config Inspector',
  icon: 'logos:eslint',
  cli: {
    command: 'eslint-config-inspector',
    distDir,
    port: 7777,
    portRange: [7777, 9000],
    host: '127.0.0.1',
    auth: false,
  },
  async setup(ctx, info) {
    const flags = (info?.flags ?? {}) as DevtoolFlags

    const readOptions: ReadConfigOptions = {
      cwd: process.cwd(),
      userConfigPath: flags.config,
      userBasePath: flags.basePath,
      globMatchedFiles: flags.files ?? true,
    }

    if (ctx.mode === 'dev') {
      try {
        await resolveConfigPath(readOptions)
      }
      catch (e) {
        if (e instanceof ConfigInspectorError) {
          e.prettyPrint()
          process.exit(1)
        }
        throw e
      }
    }

    let payload: Payload | ErrorInfo | undefined
    let watcher: FSWatcher | undefined

    async function load(): Promise<Payload | ErrorInfo> {
      if (ctx.mode === 'build') {
        if (buildPayload !== undefined)
          return buildPayload
      }

      try {
        const res = await readConfig(readOptions)
        const { basePath } = await resolveConfigPath(readOptions)

        if (ctx.mode === 'dev') {
          if (!watcher) {
            watcher = chokidar.watch([], {
              ignoreInitial: true,
              cwd: basePath,
            })
            watcher.on('change', (path) => {
              payload = undefined
              console.log()
              console.log(MARK_CHECK, 'Config change detected', path)
              ctx.rpc.broadcast({
                method: 'eslint-config-inspector:invalidate' as never,
                args: [path] as never,
              })
            })
          }
          watcher.add(res.dependencies)
        }

        payload = res.payload
        return payload
      }
      catch (e) {
        console.error(readErrorWarning)
        if (e instanceof ConfigInspectorError)
          e.prettyPrint()
        else
          console.error(e)
        payload = { message: readErrorWarning, error: String(e) }
        return payload
      }
    }

    ctx.rpc.register(defineRpcFunction({
      name: 'eslint-config-inspector:get-payload',
      type: 'query',
      jsonSerializable: true,
      snapshot: true,
      handler: async (): Promise<Payload | ErrorInfo> => payload ?? await load(),
    }))
  },
})

export default devframe
