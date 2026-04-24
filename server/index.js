import 'dotenv/config'
import process from 'node:process'

import { buildServer } from './src/app.js'

const port = Number(process.env.API_PORT || 3001)
const host = process.env.API_HOST || '127.0.0.1'

const server = await buildServer()

try {
  await server.listen({ port, host })
  server.log.info(`API listening on http://${host}:${port}`)
} catch (error) {
  server.log.error(error)
  process.exit(1)
}
