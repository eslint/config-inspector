import type { Payload } from '~~/shared/types'

import type { WebSocket } from 'ws'
import type { ReadConfigOptions } from './configs'
import process from 'node:process'
import chokidar from 'chokidar'
import { getPort } from 'get-port-please'
import { WebSocketServer } from 'ws'
import { readConfig, resolveConfigPath } from './configs'
import { MARK_CHECK } from './constants'
import { ConfigInspectorError } from './errors'

const readErrorWarning = `Failed to load \`eslint.config.js\`.
Note that \`@eslint/config-inspector\` only works with the flat config format:
https://eslint.org/docs/latest/use/configure/configuration-files-new`

export interface CreateWsServerOptions extends ReadConfigOptions {}

export async function createWsServer(options: CreateWsServerOptions) {
  let payload: Payload | undefined
  const port = await getPort({ port: 7811, random: true })
  const wss = new WebSocketServer({
    port,
  })
  const wsClients = new Set<WebSocket>()

  wss.on('connection', (ws) => {
    wsClients.add(ws)
    console.log(MARK_CHECK, 'Websocket client connected')
    ws.on('close', () => wsClients.delete(ws))
  })

  let resolvedConfigPath: Awaited<ReturnType<typeof resolveConfigPath>>
  try {
    resolvedConfigPath = await resolveConfigPath(options)
  }
  catch (e) {
    if (e instanceof ConfigInspectorError) {
      e.prettyPrint()
      process.exit(1)
    }
    else {
      throw e
    }
  }

  const { basePath } = resolvedConfigPath

  const watcher = chokidar.watch([], {
    ignoreInitial: true,
    cwd: basePath,
    disableGlobbing: true,
  })

  watcher.on('change', (path) => {
    payload = undefined
    console.log()
    console.log(MARK_CHECK, 'Config change detected', path)
    wsClients.forEach((ws) => {
      ws.send(JSON.stringify({
        type: 'config-change',
        path,
      }))
    })
  })

  async function getData() {
    try {
      if (!payload) {
        return await readConfig(options)
          .then((res) => {
            const _payload = payload = res.payload
            _payload.meta.wsPort = port
            watcher.add(res.dependencies)
            return payload
          })
      }
      return payload
    }
    catch (e) {
      console.error(readErrorWarning)
      if (e instanceof ConfigInspectorError) {
        e.prettyPrint()
      }
      else {
        console.error(e)
      }
      return {
        message: readErrorWarning,
        error: String(e),
      }
    }
  }

  return {
    port,
    wss,
    watcher,
    getData,
  }
}
