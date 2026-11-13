import { describe, expect, it } from 'vitest'

import { assertSeedAllowed } from './seed-guard.js'

const LOCAL_URL = 'postgresql://controle:segredo@localhost:5432/controleportaria?schema=public'
const REMOTE_URL =
  'postgresql://neon_owner:s3nha@ep-demo-123.sa-east-1.aws.neon.tech/demo?sslmode=require'

describe('assertSeedAllowed', () => {
  describe('banco local (sem a flag)', () => {
    it.each(['localhost', '127.0.0.1', 'postgres'])('permite o host "%s"', (host) => {
      const target = assertSeedAllowed({
        databaseUrl: `postgresql://u:p@${host}:5432/controleportaria`,
        nodeEnv: 'development',
        allowRemote: undefined,
      })

      expect(target).toEqual({ host, database: 'controleportaria', remote: false })
    })

    it('permite com NODE_ENV indefinido', () => {
      expect(
        assertSeedAllowed({ databaseUrl: LOCAL_URL, nodeEnv: undefined, allowRemote: undefined }),
      ).toMatchObject({ host: 'localhost', remote: false })
    })
  })

  describe('banco remoto', () => {
    it('bloqueia sem a flag e orienta a usar SEED_ALLOW_REMOTE=demo', () => {
      expect(() =>
        assertSeedAllowed({ databaseUrl: REMOTE_URL, nodeEnv: undefined, allowRemote: undefined }),
      ).toThrow(/ep-demo-123\.sa-east-1\.aws\.neon\.tech.*SEED_ALLOW_REMOTE=demo/)
    })

    it.each(['', 'true', '1', 'Demo', 'DEMO', ' demo', 'demo ', 'prod'])(
      'bloqueia com a flag diferente de "demo" exato (%j)',
      (allowRemote) => {
        expect(() =>
          assertSeedAllowed({ databaseUrl: REMOTE_URL, nodeEnv: undefined, allowRemote }),
        ).toThrow(/Seed bloqueado/)
      },
    )

    it('permite com SEED_ALLOW_REMOTE=demo e devolve host e banco para log', () => {
      expect(
        assertSeedAllowed({ databaseUrl: REMOTE_URL, nodeEnv: undefined, allowRemote: 'demo' }),
      ).toEqual({ host: 'ep-demo-123.sa-east-1.aws.neon.tech', database: 'demo', remote: true })
    })

    it('trata um host que apenas contém "localhost" como remoto', () => {
      expect(() =>
        assertSeedAllowed({
          databaseUrl: 'postgresql://u:p@localhost.evil.com:5432/db',
          nodeEnv: undefined,
          allowRemote: undefined,
        }),
      ).toThrow(/Seed bloqueado/)
    })
  })

  describe('NODE_ENV=production', () => {
    it('bloqueia banco local', () => {
      expect(() =>
        assertSeedAllowed({
          databaseUrl: LOCAL_URL,
          nodeEnv: 'production',
          allowRemote: undefined,
        }),
      ).toThrow('Seed bloqueado: NODE_ENV=production.')
    })

    it('bloqueia banco remoto mesmo com SEED_ALLOW_REMOTE=demo', () => {
      expect(() =>
        assertSeedAllowed({ databaseUrl: REMOTE_URL, nodeEnv: 'production', allowRemote: 'demo' }),
      ).toThrow('Seed bloqueado: NODE_ENV=production.')
    })
  })

  describe('segredos', () => {
    it('não vaza usuário nem senha na mensagem de erro nem no alvo', () => {
      let message = ''
      try {
        assertSeedAllowed({ databaseUrl: REMOTE_URL, nodeEnv: undefined, allowRemote: undefined })
      } catch (error) {
        message = (error as Error).message
      }
      expect(message).not.toContain('s3nha')
      expect(message).not.toContain('neon_owner')

      const target = assertSeedAllowed({
        databaseUrl: REMOTE_URL,
        nodeEnv: undefined,
        allowRemote: 'demo',
      })
      expect(JSON.stringify(target)).not.toContain('s3nha')
      expect(JSON.stringify(target)).not.toContain('neon_owner')
    })

    it('rejeita URL inválida sem ecoá-la', () => {
      expect(() =>
        assertSeedAllowed({
          databaseUrl: 'não é uma url',
          nodeEnv: undefined,
          allowRemote: 'demo',
        }),
      ).toThrow('Seed bloqueado: DATABASE_URL inválida.')
    })
  })
})
