import 'dotenv/config'
import process from 'node:process'

import { defineConfig } from 'prisma/config'

const databaseUrl =
  process.env.DATABASE_URL ||
  'file:./prisma/dev.db'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'node prisma/seed.js',
  },
  datasource: {
    url: databaseUrl,
  },
})
