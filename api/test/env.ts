/**
 * Carregamento e validação do ambiente de testes.
 *
 * Os testes de integração fazem TRUNCATE em todas as tabelas do banco, então
 * só podem rodar contra um PostgreSQL local cujo nome termine em `_test`.
 * Qualquer outra configuração aborta a suíte antes de tocar no banco.
 */

import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'

export const API_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const TEST_ENV_FILE = resolve(API_ROOT, '.env.test')

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]'])
const TEST_DATABASE_SUFFIX = '_test'

/**
 * Garante que a URL aponta para um banco local de testes.
 * Lança erro (abortando a suíte) se o host não for local, se o nome do banco
 * não terminar em `_test` ou se `NODE_ENV=production`.
 */
export function assertSafeTestDatabaseUrl(
  databaseUrl: string | undefined,
  nodeEnv: string | undefined,
): void {
  if (nodeEnv === 'production') {
    throw new Error('Testes bloqueados: NODE_ENV=production.')
  }

  if (!databaseUrl) {
    throw new Error('Testes bloqueados: DATABASE_URL não definida (confira api/.env.test).')
  }

  let url: URL

  try {
    url = new URL(databaseUrl)
  } catch {
    throw new Error('Testes bloqueados: DATABASE_URL inválida.')
  }

  if (!LOCAL_HOSTS.has(url.hostname)) {
    throw new Error(
      `Testes bloqueados: DATABASE_URL aponta para "${url.hostname}", que não é um banco local.`,
    )
  }

  const databaseName = decodeURIComponent(url.pathname.replace(/^\//, ''))

  if (!databaseName.endsWith(TEST_DATABASE_SUFFIX)) {
    throw new Error(
      `Testes bloqueados: o banco "${databaseName}" não termina em "${TEST_DATABASE_SUFFIX}".`,
    )
  }
}

/**
 * Carrega `api/.env.test` sobrescrevendo variáveis já definidas (inclusive as
 * que o `dotenv/config` de `src/app.ts` leria de `api/.env`) e valida o banco.
 */
export function loadTestEnv(): void {
  if (!existsSync(TEST_ENV_FILE)) {
    throw new Error(
      'Arquivo api/.env.test não encontrado. Copie api/.env.test.example para api/.env.test.',
    )
  }

  config({ path: TEST_ENV_FILE, override: true, quiet: true })
  assertSafeTestDatabaseUrl(process.env['DATABASE_URL'], process.env['NODE_ENV'])
}
