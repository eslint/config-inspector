/* eslint-disable no-console */
import process from 'node:process'
import { relative } from 'node:path'
import chokidar from 'chokidar'
import type { WebSocket } from 'ws'
import { WebSocketServer } from 'ws'
import { getPort } from 'get-port-please'
import { readConfig } from './utils'
import type { Payload } from '~/composables/types'

const readErrorWarning = `Failed to load \`eslint.config.js\`.
Note that \`@eslint/config-inspector\` only works with the flat config format:
https://eslint.org/docs/latest/use/configure/configuration-files-new`

export default lazyEventHandler(async () => {
  const wsPort = await getPort({ port: 7811, random: true })
  const wss = new WebSocketServer({
    port: wsPort,
  })
  const wsClients = new Set<WebSocket>()
  wss.on('connection', (ws) => {
    wsClients.add(ws)
    console.log('Websocket client connected')
    ws.on('close', () => wsClients.delete(ws))
  })

  const cwd = process.cwd()

  let payload: Payload | undefined = undefined!

  const watcher = chokidar.watch([], {
    ignoreInitial: true,
    cwd: process.cwd(),
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

  return defineEventHandler(async () => {
    try {
      if (!payload) {
        return await readConfig(cwd)
          .then((res) => {
            payload = res.payload
            payload.meta.wsPort = wsPort
            console.log(`Read ESLint config from \`${relative(cwd, res.payload.meta.configPath)}\` with`, payload.configs.length, 'configs and', Object.keys(payload.rules).length, 'rules')
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
  })
})
