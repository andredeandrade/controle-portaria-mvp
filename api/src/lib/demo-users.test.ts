import { describe, expect, it } from 'vitest'

import { DEMO_PASSWORD, DEMO_USERS } from './demo-users.js'
import type { UserRole } from './jwt.js'

const ALL_ROLES: readonly UserRole[] = ['ADMIN', 'GESTOR', 'SINDICO', 'SEGURANCA']

describe('DEMO_USERS', () => {
  it('tem exatamente um usuário para cada perfil', () => {
    expect(DEMO_USERS.map((user) => user.role).sort()).toEqual([...ALL_ROLES].sort())
  })

  it('usa e-mails distintos no domínio da demo, em minúsculas', () => {
    const emails = DEMO_USERS.map((user) => user.email)

    expect(new Set(emails).size).toBe(emails.length)
    for (const email of emails) {
      expect(email).toMatch(/^[a-z]+@demo\.local$/)
    }
  })

  it('usa o perfil em minúsculas como parte local do e-mail (o que o login rápido da demo espera)', () => {
    for (const user of DEMO_USERS) {
      expect(user.email).toBe(`${user.role.toLowerCase()}@demo.local`)
    }
  })

  it('compartilha uma senha de demo não vazia', () => {
    expect(DEMO_PASSWORD.length).toBeGreaterThanOrEqual(8)
  })
})
