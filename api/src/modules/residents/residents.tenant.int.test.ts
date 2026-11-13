import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { app } from '../../app.js'
import { prisma } from '../../lib/prisma.js'
import { authHeader, createTestTenant, type TestTenant } from '../../../test/helpers/factories.js'
import type { ResidentResponse } from './residents.types.js'

interface ResidentListBody {
  items: ResidentResponse[]
  pagination: { total: number }
}

const residentOfB = {
  fullName: 'Morador Fictício do B',
  units: ['B-101'],
  relation: 'proprietario',
  email: 'morador.b@exemplo.test',
  phone: '11 90000-0001',
  document: '111.222.333-44',
}

describe('residents — isolamento entre condomínios', () => {
  let tenantA: TestTenant
  let tenantB: TestTenant
  let residentIdOfB: string

  beforeEach(async () => {
    tenantA = await createTestTenant('condominio-a')
    tenantB = await createTestTenant('condominio-b')

    const created = await request(app)
      .post('/api/residents')
      .set('Authorization', authHeader(tenantB.admin))
      .send(residentOfB)
      .expect(201)

    residentIdOfB = (created.body as ResidentResponse).id
  })

  it('a listagem do A não inclui moradores do B (nem via busca)', async () => {
    const list = await request(app)
      .get('/api/residents')
      .set('Authorization', authHeader(tenantA.admin))
      .expect(200)

    const body = list.body as ResidentListBody
    expect(body.items).toHaveLength(0)
    expect(body.pagination.total).toBe(0)

    const search = await request(app)
      .get('/api/residents')
      .query({ search: 'Fictício do B' })
      .set('Authorization', authHeader(tenantA.admin))
      .expect(200)

    expect((search.body as ResidentListBody).items).toHaveLength(0)
  })

  it('a listagem do B continua vendo o próprio morador', async () => {
    const list = await request(app)
      .get('/api/residents')
      .set('Authorization', authHeader(tenantB.admin))
      .expect(200)

    expect((list.body as ResidentListBody).items.map((item) => item.id)).toEqual([residentIdOfB])
  })

  it('GET /:id de morador do B com token do A responde 404', async () => {
    await request(app)
      .get(`/api/residents/${residentIdOfB}`)
      .set('Authorization', authHeader(tenantA.admin))
      .expect(404)
  })

  it('PATCH /:id de morador do B com token do A responde 404 e não altera nada', async () => {
    await request(app)
      .patch(`/api/residents/${residentIdOfB}`)
      .set('Authorization', authHeader(tenantA.admin))
      .send({ fullName: 'Nome Sobrescrito', units: ['A-1'] })
      .expect(404)

    const stored = await prisma.resident.findUniqueOrThrow({
      where: { id: residentIdOfB },
      include: { units: true },
    })
    expect(stored.fullName).toBe(residentOfB.fullName)
    expect(stored.units.map((unit) => unit.unit)).toEqual(['B-101'])
  })

  it('DELETE /:id de morador do B com token do A responde 404 e mantém o registro', async () => {
    await request(app)
      .delete(`/api/residents/${residentIdOfB}`)
      .set('Authorization', authHeader(tenantA.admin))
      .expect(404)

    expect(await prisma.resident.count({ where: { id: residentIdOfB } })).toBe(1)
  })

  it('POST com condominiumId do B no body grava no condomínio do token (A)', async () => {
    const created = await request(app)
      .post('/api/residents')
      .set('Authorization', authHeader(tenantA.admin))
      .send({ ...residentOfB, fullName: 'Morador do A', condominiumId: tenantB.condominiumId })
      .expect(201)

    const stored = await prisma.resident.findUniqueOrThrow({
      where: { id: (created.body as ResidentResponse).id },
    })
    expect(stored.condominiumId).toBe(tenantA.condominiumId)
  })
})
