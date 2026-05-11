import type { Plugin } from 'vite'
import type { DevtoolFlags } from './devtool'
import process from 'node:process'
import { createDevServer, resolveDevServerPort } from 'devframe/adapters/dev'
import devtool from './devtool'

export function devframePlugin(flags?: DevtoolFlags): Plugin {
  let started: Awaited<ReturnType<typeof createDevServer>> | undefined

  return {
    name: 'eslint-config-inspector:devframe',
    apply: 'serve',

    async configureServer(server) {
      await started?.close().catch(() => {})

      const resolvedFlags: DevtoolFlags = {
        config: process.env.ESLINT_CONFIG,
        ...flags,
      }

      const port = await resolveDevServerPort(devtool, { defaultPort: 7777 })

      started = await createDevServer(devtool, {
        port,
        flags: resolvedFlags,
        openBrowser: false,
        onReady: ({ port: p }) => {
          server.config.logger.info(
            `\n  > eslint-config-inspector devframe RPC ready on ws://localhost:${p}\n`,
          )
        },
      })

      server.middlewares.use('/__connection.json', (_req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ backend: 'websocket', websocket: port }))
      })

      server.httpServer?.once('close', () => {
        void started?.close()
      })
    },

    async closeBundle() {
      await started?.close()
      started = undefined
    },
  }
}
