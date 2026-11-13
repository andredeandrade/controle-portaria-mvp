/**
 * Global setup dos testes de integração (roda uma vez, antes dos workers):
 * 1. carrega e valida `api/.env.test` (aborta se o banco não for local/_test);
 * 2. cria o banco de teste se ainda não existir;
 * 3. aplica as migrations com `prisma migrate deploy`.
 */

import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import pg from 'pg'
import { API_ROOT, loadTestEnv } from './env.js'

async function ensureDatabaseExists(databaseUrl: string): Promise<void> {
  const url = new URL(databaseUrl)
  const databaseName = decodeURIComponent(url.pathname.replace(/^\//, ''))

  const adminUrl = new URL(databaseUrl)
  adminUrl.pathname = '/postgres'
  adminUrl.search = ''

  const client = new pg.Client({ connectionString: adminUrl.toString() })
  await client.connect()

  try {
    const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      databaseName,
    ])

    if (result.rowCount === 0) {
      // Nome já validado por assertSafeTestDatabaseUrl; aspas evitam problemas com maiúsculas.
      await client.query(`CREATE DATABASE "${databaseName.replace(/"/g, '""')}"`)
    }
  } finally {
    await client.end()
  }
}

export default async function globalSetup(): Promise<void> {
  loadTestEnv()

  const databaseUrl = process.env['DATABASE_URL']

  if (!databaseUrl) {
    throw new Error('DATABASE_URL não definida.')
  }

  await ensureDatabaseExists(databaseUrl)

  execFileSync(resolve(API_ROOT, 'node_modules/.bin/prisma'), ['migrate', 'deploy'], {
    cwd: API_ROOT,
    env: process.env,
    stdio: 'inherit',
  })
}
