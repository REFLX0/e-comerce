import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const connectionString = `${process.env.DATABASE_URL}`

// Explicit pool size instead of pg's implicit default (10) — this is the
// entire connection budget for the frontend against Postgres, since the
// Prisma driver adapter bypasses Prisma's own connection_limit handling.
const pool = new Pool({ connectionString, max: 10, idleTimeoutMillis: 30000 })
const adapter = new PrismaPg(pool)

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
