import { afterEach, describe, expect, it, vi } from 'vitest'

import { DEMO_ACCOUNTS, DEMO_PASSWORD, isDemoMode } from './demo'

describe('isDemoMode', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('é verdadeiro apenas para o valor exato "true"', () => {
    vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', 'true')

    expect(isDemoMode()).toBe(true)
  })

  it.each(['', 'false', '1', 'TRUE', 'True', ' true'])('é falso para %j', (value) => {
    vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', value)

    expect(isDemoMode()).toBe(false)
  })

  it('é falso quando a variável não está definida', () => {
    vi.stubEnv('NEXT_PUBLIC_DEMO_MODE', undefined)

    expect(isDemoMode()).toBe(false)
  })
})

describe('DEMO_ACCOUNTS', () => {
  it('cobre os 4 perfis na ordem esperada', () => {
    expect(DEMO_ACCOUNTS.map((account) => account.role)).toEqual([
      'ADMIN',
      'GESTOR',
      'SINDICO',
      'SEGURANCA',
    ])
  })

  it.each(DEMO_ACCOUNTS)('usa o e-mail <perfil>@demo.local para $role', (account) => {
    expect(account.email).toBe(`${account.role.toLowerCase()}@demo.local`)
  })

  it('define a senha da demo', () => {
    expect(DEMO_PASSWORD).toBe('Senha@123')
  })
})
