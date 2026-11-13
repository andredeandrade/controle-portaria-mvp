import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { app } from '../../app.js'
import { prisma } from '../../lib/prisma.js'
import { authHeader, createTestTenant, type TestTenant } from '../../../test/helpers/factories.js'
import type { AuthorizationResponse } from './authorizations.types.js'

interface AuthorizationListBody {
  items: AuthorizationResponse[]
  pagination: { total: number }
}

const authorizationOfB = {
  authorizedName: 'Autorizado Fictício do B',
  personType: 'prestador_servico',
  document: '33.444.555-6',
  phone: '11 90000-0003',
  company: 'Empresa Fictícia',
  unit: 'B-303',
  authorizedBy: 'Morador Fictício',
  validFromDate: '2026-11-01',
  validFromTime: '08:00',
  validToDate: '2026-11-30',
  validToTime: '18:00',
}

describe('authorizations — isolamento entre condomínios', () => {
  let tenantA: TestTenant
  let tenantB: TestTenant
  let authorizationIdOfB: string

  beforeEach(async () => {
    tenantA = await createTestTenant('condominio-a')
    tenantB = await createTestTenant('condominio-b')

    const created = await request(app)
      .post('/api/authorizations')
      .set('Authorization', authHeader(tenantB.admin))
      .send(authorizationOfB)
      .expect(201)

    authorizationIdOfB = (created.body as AuthorizationResponse).id
  })

  it('a listagem do A não inclui autorizações do B (nem via busca)', async () => {
    const list = await request(app)
      .get('/api/authorizations')
      .set('Authorization', authHeader(tenantA.admin))
      .expect(200)

    expect((list.body as AuthorizationListBody).items).toHaveLength(0)
    expect((list.body as AuthorizationListBody).pagination.total).toBe(0)

    const search = await request(app)
      .get('/api/authorizations')
      .query({ search: 'Fictício do B' })
      .set('Authorization', authHeader(tenantA.admin))
      .expect(200)

    expect((search.body as AuthorizationListBody).items).toHaveLength(0)
  })

  it('GET /:id de autorização do B com token do A responde 404', async () => {
    await request(app)
      .get(`/api/authorizations/${authorizationIdOfB}`)
      .set('Authorization', authHeader(tenantA.admin))
      .expect(404)
  })

  it('PATCH /:id de autorização do B com token do A responde 404 e não altera nada', async () => {
    await request(app)
      .patch(`/api/authorizations/${authorizationIdOfB}`)
      .set('Authorization', authHeader(tenantA.admin))
      .send({ authorizedName: 'Nome Sobrescrito', validToDate: '2027-12-31' })
      .expect(404)

    const stored = await prisma.authorization.findUniqueOrThrow({
      where: { id: authorizationIdOfB },
    })
    expect(stored.authorizedName).toBe(authorizationOfB.authorizedName)
    expect(stored.validToDate).toBe(authorizationOfB.validToDate)
  })

  it('DELETE /:id de autorização do B com token do A responde 404 e mantém o registro', async () => {
    await request(app)
      .delete(`/api/authorizations/${authorizationIdOfB}`)
      .set('Authorization', authHeader(tenantA.admin))
      .expect(404)

    expect(await prisma.authorization.count({ where: { id: authorizationIdOfB } })).toBe(1)
  })

  it('POST com condominiumId do B no body grava no condomínio do token (A)', async () => {
    const created = await request(app)
      .post('/api/authorizations')
      .set('Authorization', authHeader(tenantA.admin))
      .send({ ...authorizationOfB, condominiumId: tenantB.condominiumId })
      .expect(201)

    const stored = await prisma.authorization.findUniqueOrThrow({
      where: { id: (created.body as AuthorizationResponse).id },
    })
    expect(stored.condominiumId).toBe(tenantA.condominiumId)
  })
})
