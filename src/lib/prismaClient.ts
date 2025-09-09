import { PrismaClient } from '@prisma/client'

declare global {
  var prismaclient: PrismaClient | undefined
}

const prismaClient =
  global.prismaclient ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') global.prismaclient = prismaClient

export default prismaClient
