import { prisma } from '../../lib/prisma.js'

/** Tempo máximo para o banco responder ao `SELECT 1` do readiness. */
export const DATABASE_CHECK_TIMEOUT_MS = 3_000

export const healthService = {
  /**
   * Confere se o banco responde a um `SELECT 1` dentro do prazo.
   * Nunca lança: qualquer falha (conexão, timeout) vira `false`, e o motivo não sai
   * da API (health é público; mensagens de erro do driver podem vazar host e usuário).
   */
  async isDatabaseReachable(timeoutMs: number = DATABASE_CHECK_TIMEOUT_MS): Promise<boolean> {
    let timer: NodeJS.Timeout | undefined

    const timeout = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => reject(new Error('timeout')), timeoutMs)
    })

    try {
      await Promise.race([prisma.$queryRaw`SELECT 1`, timeout])
      return true
    } catch {
      return false
    } finally {
      clearTimeout(timer)
    }
  },
}
