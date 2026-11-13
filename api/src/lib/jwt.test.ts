import jwt from 'jsonwebtoken'
import { describe, expect, it } from 'vitest'
import { signAccessToken, verifyAccessToken } from './jwt.js'
import { HttpError } from './http-error.js'

const payload = {
  sub: 'usuario-ficticio-1',
  email: 'portaria@exemplo.test',
  role: 'SEGURANCA' as const,
  condominiumId: 'condominio-ficticio-1',
}

function expectUnauthorized(token: string): void {
  try {
    verifyAccessToken(token)
  } catch (error) {
    expect(error).toBeInstanceOf(HttpError)
    expect((error as HttpError).statusCode).toBe(401)
    return
  }

  throw new Error('verifyAccessToken deveria ter rejeitado o token.')
}

describe('lib/jwt', () => {
  it('assina e valida um token, devolvendo apenas os campos esperados', () => {
    const token = signAccessToken(payload)

    expect(verifyAccessToken(token)).toEqual(payload)
  })

  it('rejeita token assinado com outro segredo', () => {
    expectUnauthorized(jwt.sign(payload, 'segredo-de-outro-sistema'))
  })

  it('rejeita token expirado', () => {
    const secret = process.env['JWT_SECRET'] ?? ''

    expectUnauthorized(jwt.sign({ ...payload, exp: Math.floor(Date.now() / 1000) - 60 }, secret))
  })

  it('rejeita token sem condominiumId ou com role desconhecida', () => {
    const secret = process.env['JWT_SECRET'] ?? ''
    const { condominiumId: _ignored, ...semTenant } = payload

    expectUnauthorized(jwt.sign(semTenant, secret))
    expectUnauthorized(jwt.sign({ ...payload, role: 'PORTARIA' }, secret))
    expectUnauthorized(jwt.sign({ ...payload, role: 'SUPERADMIN' }, secret))
  })

  it('rejeita string que não é JWT', () => {
    expectUnauthorized('isto-nao-e-um-jwt')
  })
})
