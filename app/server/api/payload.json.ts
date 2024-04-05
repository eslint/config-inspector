import process from 'node:process'
import { createWsServer } from '~~/src/ws'

export default lazyEventHandler(async () => {
  const ws = await createWsServer({
    cwd: process.cwd(),
  })

  return defineEventHandler(async () => {
    return await ws.getData()
  })
})
