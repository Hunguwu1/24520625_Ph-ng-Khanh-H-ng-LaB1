import { createApiServer } from './app.ts'

const port = 3000
const server = createApiServer()

server.listen(port, '127.0.0.1', () => {
  console.log(`API đang chạy tại http://127.0.0.1:${port}`)
})
