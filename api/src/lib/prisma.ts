/**
 * Instância única (singleton) do Prisma Client.
 *
 * O Prisma 7 com provider "prisma-client" usa o modelo de Driver Adapters:
 * em vez de um binário embutido, ele delega as queries ao driver nativo do
 * banco (pg para PostgreSQL). Isso melhora performance e compatibilidade.
 *
 * Reutiliza a mesma conexão durante o ciclo de vida do servidor,
 * evitando abrir múltiplas conexões com o banco de dados.
 * Em desenvolvimento, o hot-reload do tsx recriaria a instância
 * a cada mudança — o globalThis previne isso.
 */

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma-client/client.js'
import { env } from '../config/env.js'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: env.databaseUrl })

  return new PrismaClient({
    adapter,
    log: env.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (env.nodeEnv !== 'production') {
  globalForPrisma.prisma = prisma
}
