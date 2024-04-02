import { createServer } from 'node:http'
import connect from 'connect'
import sirv from 'sirv'
import { createWsServer } from './ws'
import { distDir } from './dirs'

export async function createHostServer() {
  const app = connect()

  console.log()

  app.use(sirv(distDir, {
    dev: true,
    single: true,
  }))

  const ws = await createWsServer()

  app.use('/api/payload.json', async (_req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(await ws.getData()))
  })

  const server = createServer(app)

  return server
}
