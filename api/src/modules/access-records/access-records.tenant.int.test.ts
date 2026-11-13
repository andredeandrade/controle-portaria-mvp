import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { app } from '../../app.js'
import { prisma } from '../../lib/prisma.js'
import { authHeader, createTestTenant, type TestTenant } from '../../../test/helpers/factories.js'
import type { AccessRecordResponse } from './access-records.types.js'

interface AccessRecordListBody {
  items: AccessRecordResponse[]
  pagination: { total: number }
}

const personOfB = {
  category: 'visitante',
  name: 'Visitante Fictício do B',
  document: '44.555.666-7',
  unit: 'B-404',
}

describe('access-records — isolamento entre condomínios', () => {
  let tenantA: TestTenant
  let tenantB: TestTenant
  let accessRecordIdOfB: string

  beforeEach(async () => {
    tenantA = await createTestTenant('condominio-a')
    tenantB = await createTestTenant('condominio-b')

    const created = await request(app)
      .post('/api/access-records/check-in')
      .set('Authorization', authHeader(tenantB.seguranca))
      .send({ people: [personOfB], locomotion: 'carro', plate: 'BBB1B11' })
      .expect(201)

    accessRecordIdOfB = (created.body as AccessRecordResponse).id
  })

  it('a listagem do A não inclui registros do B (todos os status e busca)', async () => {
    for (const status of ['all', 'open', 'closed']) {
      const list = await request(app)
        .get('/api/access-records')
        .query({ status })
        .set('Authorization', authHeader(tenantA.seguranca))
        .expect(200)

      expect((list.body as AccessRecordListBody).items).toHaveLength(0)
    }

    const search = await request(app)
      .get('/api/access-records')
      .query({ search: 'Fictício do B' })
      .set('Authorization', authHeader(tenantA.admin))
      .expect(200)

    expect((search.body as AccessRecordListBody).items).toHaveLength(0)
  })

  it('GET /:id de registro do B com token do A responde 404', async () => {
    await request(app)
      .get(`/api/access-records/${accessRecordIdOfB}`)
      .set('Authorization', authHeader(tenantA.admin))
      .expect(404)
  })

  it('check-out de registro do B com token do A responde 404 e o registro continua aberto', async () => {
    const stored = await prisma.accessRecord.findUniqueOrThrow({
      where: { id: accessRecordIdOfB },
      include: { people: true },
    })

    await request(app)
      .post(`/api/access-records/${accessRecordIdOfB}/check-out`)
      .set('Authorization', authHeader(tenantA.seguranca))
      .send({ personIds: stored.people.map((person) => person.id) })
      .expect(404)

    const after = await prisma.accessRecord.findUniqueOrThrow({
      where: { id: accessRecordIdOfB },
      include: { people: true },
    })
    expect(after.checkOutAt).toBeNull()
    expect(after.people.every((person) => person.checkOutAt === null)).toBe(true)
  })

  it('acesso ativo no B não bloqueia check-in da mesma pessoa no A', async () => {
    const created = await request(app)
      .post('/api/access-records/check-in')
      .set('Authorization', authHeader(tenantA.seguranca))
      .send({ people: [personOfB] })
      .expect(201)

    const stored = await prisma.accessRecord.findUniqueOrThrow({
      where: { id: (created.body as AccessRecordResponse).id },
    })
    expect(stored.condominiumId).toBe(tenantA.condominiumId)
  })

  it('acesso ativo bloqueia novo check-in da mesma pessoa no mesmo condomínio (409)', async () => {
    await request(app)
      .post('/api/access-records/check-in')
      .set('Authorization', authHeader(tenantB.seguranca))
      .send({ people: [personOfB] })
      .expect(409)
  })

  it('check-in com condominiumId do B no body grava no condomínio do token (A)', async () => {
    const created = await request(app)
      .post('/api/access-records/check-in')
      .set('Authorization', authHeader(tenantA.seguranca))
      .send({
        condominiumId: tenantB.condominiumId,
        people: [{ category: 'morador', name: 'Morador Fictício do A', unit: 'A-1' }],
      })
      .expect(201)

    const stored = await prisma.accessRecord.findUniqueOrThrow({
      where: { id: (created.body as AccessRecordResponse).id },
    })
    expect(stored.condominiumId).toBe(tenantA.condominiumId)
  })
})
