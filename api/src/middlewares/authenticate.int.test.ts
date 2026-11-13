import jwt from 'jsonwebtoken'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { app } from '../app.js'
import { signAccessToken } from '../lib/jwt.js'
import { prisma } from '../lib/prisma.js'
import { authHeader, createTestTenant, type TestTenant } from '../../test/helpers/factories.js'

/** Rotas protegidas por `authenticate`, uma de cada módulo. */
const PROTECTED_ROUTES: ReadonlyArray<readonly ['get' | 'post' | 'patch' | 'delete', string]> = [
  ['get', '/api/auth/me'],
  ['get', '/api/auth/admin-area'],
  ['get', '/api/condominiums/me'],
  ['patch', '/api/condominiums/me'],
  ['get', '/api/residents'],
  ['post', '/api/residents'],
  ['get', '/api/visitors'],
  ['delete', '/api/visitors/qualquer-id'],
  ['get', '/api/service-providers'],
  ['get', '/api/authorizations'],
  ['get', '/api/events'],
  ['get', '/api/incidents'],
  ['get', '/api/access-records'],
  ['post', '/api/access-records/check-in'],
  ['get', '/api/dashboard/summary'],
  ['get', '/api/reports/accesses'],
]

describe('middleware authenticate', () => {
  let tenantA: TestTenant

  beforeEach(async () => {
    tenantA = await createTestTenant('condominio-a')
  })

  it.each(PROTECTED_ROUTES)('%s %s responde 401 sem token', async (method, path) => {
    const response = await request(app)[method](path)

    expect(response.status).toBe(401)
    expect(response.body).toEqual({ error: 'Token não informado.' })
  })

  it.each(PROTECTED_ROUTES)('%s %s responde 401 com token inválido', async (method, path) => {
    const response = await request(app)[method](path).set('Authorization', 'Bearer token-falso')

    expect(response.status).toBe(401)
  })

  it('responde 401 quando o esquema não é Bearer', async () => {
    const response = await request(app)
      .get('/api/residents')
      .set('Authorization', `Basic ${tenantA.admin.token}`)

    expect(response.status).toBe(401)
    expect(response.body).toEqual({ error: 'Formato de token inválido.' })
  })

  it('responde 401 para token assinado com outro segredo', async () => {
    const forged = jwt.sign(
      {
        sub: tenantA.admin.id,
        email: tenantA.admin.email,
        role: 'ADMIN',
        condominiumId: tenantA.condominiumId,
      },
      'segredo-de-atacante',
    )

    const response = await request(app)
      .get('/api/residents')
      .set('Authorization', `Bearer ${forged}`)

    expect(response.status).toBe(401)
  })

  it('responde 401 para token expirado', async () => {
    const expired = jwt.sign(
      {
        sub: tenantA.admin.id,
        email: tenantA.admin.email,
        role: 'ADMIN',
        condominiumId: tenantA.condominiumId,
        exp: Math.floor(Date.now() / 1000) - 60,
      },
      process.env['JWT_SECRET'] ?? '',
    )

    const response = await request(app)
      .get('/api/residents')
      .set('Authorization', `Bearer ${expired}`)

    expect(response.status).toBe(401)
  })

  it('responde 401 quando o usuário do token foi removido', async () => {
    await prisma.user.delete({ where: { id: tenantA.seguranca.id } })

    const response = await request(app)
      .get('/api/residents')
      .set('Authorization', authHeader(tenantA.seguranca))

    expect(response.status).toBe(401)
    expect(response.body).toEqual({ error: 'Usuário do token não encontrado.' })
  })

  it('responde 401 quando o token aponta o usuário para outro condomínio', async () => {
    const tenantB = await createTestTenant('condominio-b')
    const crossTenantToken = signAccessToken({
      sub: tenantA.admin.id,
      email: tenantA.admin.email,
      role: 'ADMIN',
      condominiumId: tenantB.condominiumId,
    })

    const response = await request(app)
      .get('/api/residents')
      .set('Authorization', `Bearer ${crossTenantToken}`)

    expect(response.status).toBe(401)
  })

  it('aceita token válido e devolve o usuário autenticado em /auth/me', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', authHeader(tenantA.admin))

    expect(response.status).toBe(200)
    expect(JSON.stringify(response.body)).toContain(tenantA.admin.email)
    expect(JSON.stringify(response.body)).not.toContain('passwordHash')
  })
})
