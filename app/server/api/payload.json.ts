import { createWsServer } from '~~/src/ws'

export default lazyEventHandler(async () => {
  const ws = await createWsServer()

  return defineEventHandler(async () => {
    return await ws.getData()
  })
})
