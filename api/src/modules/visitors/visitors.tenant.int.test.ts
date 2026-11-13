import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { app } from '../../app.js'
import { prisma } from '../../lib/prisma.js'
import { authHeader, createTestTenant, type TestTenant } from '../../../test/helpers/factories.js'
import type { VisitorResponse } from './visitors.types.js'

interface VisitorListBody {
  items: VisitorResponse[]
  pagination: { total: number }
}

const visitorOfB = {
  fullName: 'Visitante Fictício do B',
  document: '22.333.444-5',
  phone: '11 90000-0002',
  email: 'visitante.b@exemplo.test',
  unit: 'B-202',
  authorizedBy: 'Morador Fictício',
}

describe('visitors — isolamento entre condomínios', () => {
  let tenantA: TestTenant
  let tenantB: TestTenant
  let visitorIdOfB: string

  beforeEach(async () => {
    tenantA = await createTestTenant('condominio-a')
    tenantB = await createTestTenant('condominio-b')

    const created = await request(app)
      .post('/api/visitors')
      .set('Authorization', authHeader(tenantB.admin))
      .send(visitorOfB)
      .expect(201)

    visitorIdOfB = (created.body as VisitorResponse).id
  })

  it('a listagem do A não inclui visitantes do B (nem via busca)', async () => {
    const list = await request(app)
      .get('/api/visitors')
      .set('Authorization', authHeader(tenantA.admin))
      .expect(200)

    expect((list.body as VisitorListBody).items).toHaveLength(0)
    expect((list.body as VisitorListBody).pagination.total).toBe(0)

    const search = await request(app)
      .get('/api/visitors')
      .query({ search: 'Fictício do B' })
      .set('Authorization', authHeader(tenantA.admin))
      .expect(200)

    expect((search.body as VisitorListBody).items).toHaveLength(0)
  })

  it('GET /:id de visitante do B com token do A responde 404', async () => {
    await request(app)
      .get(`/api/visitors/${visitorIdOfB}`)
      .set('Authorization', authHeader(tenantA.admin))
      .expect(404)

    // Perfil de portaria do A também não enxerga.
    await request(app)
      .get(`/api/visitors/${visitorIdOfB}`)
      .set('Authorization', authHeader(tenantA.seguranca))
      .expect(404)
  })

  it('PATCH /:id de visitante do B com token do A responde 404 e não altera nada', async () => {
    await request(app)
      .patch(`/api/visitors/${visitorIdOfB}`)
      .set('Authorization', authHeader(tenantA.admin))
      .send({ fullName: 'Nome Sobrescrito', unit: 'A-1' })
      .expect(404)

    const stored = await prisma.visitor.findUniqueOrThrow({ where: { id: visitorIdOfB } })
    expect(stored.fullName).toBe(visitorOfB.fullName)
    expect(stored.unit).toBe(visitorOfB.unit)
  })

  it('DELETE /:id de visitante do B com token do A responde 404 e mantém o registro', async () => {
    await request(app)
      .delete(`/api/visitors/${visitorIdOfB}`)
      .set('Authorization', authHeader(tenantA.admin))
      .expect(404)

    expect(await prisma.visitor.count({ where: { id: visitorIdOfB } })).toBe(1)
  })

  it('POST com condominiumId do B no body grava no condomínio do token (A)', async () => {
    const created = await request(app)
      .post('/api/visitors')
      .set('Authorization', authHeader(tenantA.admin))
      .send({ ...visitorOfB, condominiumId: tenantB.condominiumId })
      .expect(201)

    const stored = await prisma.visitor.findUniqueOrThrow({
      where: { id: (created.body as VisitorResponse).id },
    })
    expect(stored.condominiumId).toBe(tenantA.condominiumId)
  })
})
