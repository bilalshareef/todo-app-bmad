import path from 'node:path'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  earlyAccess: true,
  schema: path.join(import.meta.dirname, 'prisma/schema.prisma'),
  migrations: {
    path: path.join(import.meta.dirname, 'prisma/migrations'),
  },
  datasource: {
    url: process.env.DATABASE_URL ?? 'postgresql://user:password@localhost:5432/todoapp',
  },
})
