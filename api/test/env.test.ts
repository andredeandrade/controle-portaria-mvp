import { describe, expect, it } from 'vitest'
import { assertSafeTestDatabaseUrl } from './env.js'

describe('assertSafeTestDatabaseUrl', () => {
  it('aceita banco local terminado em _test', () => {
    expect(() =>
      assertSafeTestDatabaseUrl(
        'postgresql://u:s@localhost:5432/controleportaria_test?schema=public',
        'test',
      ),
    ).not.toThrow()
    expect(() =>
      assertSafeTestDatabaseUrl('postgresql://u:s@127.0.0.1:5432/app_test', 'test'),
    ).not.toThrow()
  })

  it('bloqueia host que não é local', () => {
    expect(() =>
      assertSafeTestDatabaseUrl('postgresql://u:s@db.exemplo.com:5432/app_test', 'test'),
    ).toThrow(/não é um banco local/)
    expect(() =>
      assertSafeTestDatabaseUrl('postgresql://u:s@postgres:5432/app_test', 'test'),
    ).toThrow(/não é um banco local/)
  })

  it('bloqueia banco cujo nome não termina em _test', () => {
    expect(() =>
      assertSafeTestDatabaseUrl('postgresql://u:s@localhost:5432/controleportaria', 'test'),
    ).toThrow(/não termina em "_test"/)
    expect(() =>
      assertSafeTestDatabaseUrl('postgresql://u:s@localhost:5432/app_test_backup', 'test'),
    ).toThrow(/não termina em "_test"/)
  })

  it('bloqueia NODE_ENV=production, URL ausente ou inválida', () => {
    expect(() =>
      assertSafeTestDatabaseUrl('postgresql://u:s@localhost:5432/app_test', 'production'),
    ).toThrow(/production/)
    expect(() => assertSafeTestDatabaseUrl(undefined, 'test')).toThrow(/não definida/)
    expect(() => assertSafeTestDatabaseUrl('isto não é url', 'test')).toThrow(/inválida/)
  })
})
