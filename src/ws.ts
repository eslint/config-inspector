import process from 'node:process'
import { relative } from 'node:path'
import chokidar from 'chokidar'
import type { WebSocket } from 'ws'
import { WebSocketServer } from 'ws'
import { getPort } from 'get-port-please'
import { type ReadConfigOptions, readConfig } from './configs'
import type { Payload } from '~~/types'

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
    console.log('Websocket client connected')
    ws.on('close', () => wsClients.delete(ws))
  })

  const watcher = chokidar.watch([], {
    ignoreInitial: true,
    cwd: options.cwd,
    disableGlobbing: true,
  })

  watcher.on('change', (path) => {
    payload = undefined
    console.log('Config change detected', path)
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
            console.log(`Read ESLint config from \`${relative(options.cwd, _payload.meta.configPath)}\` with`, _payload.configs.length, 'configs and', Object.keys(_payload.rules).length, 'rules')
            watcher.add(res.dependencies)
            return payload
          })
      }
      return payload
    }
    catch (e) {
      console.error(readErrorWarning)
      console.error(e)
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
