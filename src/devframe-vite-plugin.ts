import type { Plugin } from 'vite'
import type { DevtoolFlags } from './devframe'
import process from 'node:process'
import { createDevServer, resolveDevServerPort } from 'devframe/adapters/dev'
import devframe from './devframe'

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

      const port = await resolveDevServerPort(devframe, { defaultPort: 7777 })

      started = await createDevServer(devframe, {
        port,
        flags: resolvedFlags as Record<string, unknown>,
        openBrowser: false,
        onReady: ({ port: p }) => {
          server.config.logger.info(
            `\n  > eslint-config-inspector devframe RPC ready on ws://localhost:${p}\n`,
          )
        },
      })

      server.middlewares.use('/__connection.json', (_req, res) => {
        // The devframe RPC server runs on its own port (`port`), while this
        // Vite dev server hosts the SPA on a different origin. Forward the
        // devframe server's own connection meta (WS route, jsonSerializable
        // methods, ...) but inject the port so the browser dials the RPC
        // socket on the right origin instead of Vite's.
        const meta = started!.connectionMeta()
        const ws = typeof meta.websocket === 'object' && meta.websocket !== null
          ? meta.websocket
          : {}
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ ...meta, websocket: { ...ws, port } }))
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
