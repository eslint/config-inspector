import { createServer } from 'node:http'
import connect from 'connect'
import sirv from 'sirv'
import { type CreateWsServerOptions, createWsServer } from './ws'
import { distDir } from './dirs'

export async function createHostServer(options: CreateWsServerOptions) {
  const app = connect()

  const ws = await createWsServer(options)

  app.use('/api/payload.json', async (_req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(await ws.getData()))
  })

  app.use(sirv(distDir, {
    dev: true,
    single: true,
  }))

  return createServer(app)
}
