import { join } from 'node:path'
import { readFile, stat } from 'node:fs/promises'
import { createApp, eventHandler, serveStatic } from 'h3'
import { lookup } from 'mrmime'
import { type CreateWsServerOptions, createWsServer } from './ws'
import { distDir } from './dirs'

export async function createHostServer(options: CreateWsServerOptions) {
  const app = createApp()

  const ws = await createWsServer(options)

  app.use('/api/payload.json', eventHandler(async (event) => {
    event.node.res.setHeader('Content-Type', 'application/json')
    return event.node.res.end(JSON.stringify(await ws.getData()))
  }))

  app.use('/', eventHandler(async (event) => {
    const result = await serveStatic(event, {
      fallthrough: true,
      getContents: id => readFile(join(distDir, id), 'utf-8'),
      getMeta: async (id) => {
        const stats = await stat(join(distDir, id)).catch(() => {})
        if (!stats || !stats.isFile())
          return

        return {
          type: lookup(id),
          size: stats.size,
          mtime: stats.mtimeMs,
        }
      },
    })

    if (result === false)
      return readFile(join(distDir, 'index.html'), 'utf8')
  }))

  return app
}
