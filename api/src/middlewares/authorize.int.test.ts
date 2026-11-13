import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { app } from '../app.js'
import { prisma } from '../lib/prisma.js'
import { authHeader, createTestTenant, type TestTenant } from '../../test/helpers/factories.js'

type Method = 'get' | 'post' | 'patch' | 'delete'

const FORBIDDEN_MESSAGE = 'Você não tem permissão para acessar este recurso.'

/**
 * Rotas que o perfil de portaria (SEGURANCA — antigo PORTARIA) não pode usar.
 * O id fictício não importa: o 403 precisa vir antes de qualquer busca no banco.
 */
const ROUTES_FORBIDDEN_FOR_SEGURANCA: ReadonlyArray<readonly [Method, string]> = [
  ['get', '/api/auth/admin-area'],
  ['post', '/api/auth/register'],
  ['patch', '/api/condominiums/me'],
  ['post', '/api/residents'],
  ['patch', '/api/residents/id-ficticio'],
  ['delete', '/api/residents/id-ficticio'],
  ['post', '/api/visitors'],
  ['patch', '/api/visitors/id-ficticio'],
  ['delete', '/api/visitors/id-ficticio'],
  ['post', '/api/service-providers'],
  ['delete', '/api/service-providers/id-ficticio'],
  ['post', '/api/authorizations'],
  ['patch', '/api/authorizations/id-ficticio'],
  ['delete', '/api/authorizations/id-ficticio'],
  ['post', '/api/events'],
  ['delete', '/api/events/id-ficticio'],
  ['delete', '/api/incidents/id-ficticio'],
  ['get', '/api/reports/accesses'],
  ['get', '/api/reports/residents'],
]

describe('autorização por perfil', () => {
  let tenant: TestTenant

  beforeEach(async () => {
    tenant = await createTestTenant('condominio-a')
  })

  it.each(ROUTES_FORBIDDEN_FOR_SEGURANCA)('SEGURANCA recebe 403 em %s %s', async (method, path) => {
    const response = await request(app)
      [method](path)
      .set('Authorization', authHeader(tenant.seguranca))
      .send({})

    expect(response.status).toBe(403)
    expect(response.body).toEqual({ error: FORBIDDEN_MESSAGE })
  })

  it('SEGURANCA não consegue criar usuário nem alterar o condomínio', async () => {
    const usersBefore = await prisma.user.count()

    await request(app)
      .post('/api/auth/register')
      .set('Authorization', authHeader(tenant.seguranca))
      .send({
        name: 'Novo Admin',
        email: 'novo@exemplo.test',
        password: 'Senha@123',
        role: 'ADMIN',
      })
      .expect(403)

    await request(app)
      .patch('/api/condominiums/me')
      .set('Authorization', authHeader(tenant.seguranca))
      .send({ name: 'Nome alterado' })
      .expect(403)

    expect(await prisma.user.count()).toBe(usersBefore)
    const condominium = await prisma.condominium.findUniqueOrThrow({
      where: { id: tenant.condominiumId },
    })
    expect(condominium.name).toBe('Condomínio condominio-a')
  })

  it('ADMIN acessa a área administrativa e os relatórios', async () => {
    await request(app)
      .get('/api/auth/admin-area')
      .set('Authorization', authHeader(tenant.admin))
      .expect(200)

    await request(app)
      .get('/api/reports/accesses')
      .set('Authorization', authHeader(tenant.admin))
      .expect((response) => expect(response.status).not.toBe(403))
  })

  it('SEGURANCA pode listar cadastros e registrar entrada (permissões da portaria)', async () => {
    await request(app)
      .get('/api/residents')
      .set('Authorization', authHeader(tenant.seguranca))
      .expect(200)

    await request(app)
      .post('/api/access-records/check-in')
      .set('Authorization', authHeader(tenant.seguranca))
      .send({
        people: [{ category: 'visitante', name: 'Visitante Fictício', document: '1234567' }],
      })
      .expect(201)
  })

  it('ADMIN autenticado cria usuário sempre no próprio condomínio, ignorando condominiumId do body', async () => {
    const tenantB = await createTestTenant('condominio-b')

    const response = await request(app)
      .post('/api/auth/register')
      .set('Authorization', authHeader(tenant.admin))
      .send({
        condominiumId: tenantB.condominiumId,
        name: 'Porteiro Novo',
        email: 'porteiro.novo@exemplo.test',
        password: 'Senha@123',
        role: 'SEGURANCA',
      })

    expect(response.status).toBe(201)

    const created = await prisma.user.findFirstOrThrow({
      where: { email: 'porteiro.novo@exemplo.test' },
    })
    expect(created.condominiumId).toBe(tenant.condominiumId)
  })
})
