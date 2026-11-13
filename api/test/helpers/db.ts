import { prisma } from '../../src/lib/prisma.js'

/**
 * Esvazia todas as tabelas do schema `public` (exceto o histórico de
 * migrations). Só é seguro porque `loadTestEnv()` já garantiu que o banco é
 * local e termina em `_test`.
 */
export async function resetDatabase(): Promise<void> {
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
  `

  if (tables.length === 0) {
    return
  }

  const tableList = tables.map(({ tablename }) => `"public"."${tablename}"`).join(', ')
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`)
}
