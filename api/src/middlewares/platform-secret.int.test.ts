import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { app } from '../app.js'
import { env, isDemoMode } from '../config/env.js'
import { prisma } from '../lib/prisma.js'
import { authHeader, createTestTenant, type TestTenant } from '../../test/helpers/factories.js'
import { DEMO_SLUG_CHANGE_DISABLED_MESSAGE } from '../modules/condominiums/condominiums.controller.js'
import { DEMO_SETUP_DISABLED_MESSAGE } from './platform-secret.js'

const SECRET_HEADER = 'x-platform-setup-secret'
const VALID_SECRET = env.platformSetupSecret

function createCondominium(secret?: string) {
  const req = request(app).post('/api/condominiums')

  return (secret === undefined ? req : req.set(SECRET_HEADER, secret)).send({
    name: 'Condomínio Novo',
    slug: 'condominio-novo',
  })
}

function bootstrapUser(condominiumId: string, secret?: string) {
  const req = request(app).post('/api/auth/register')

  return (secret === undefined ? req : req.set(SECRET_HEADER, secret)).send({
    condominiumId,
    name: 'Admin Injetado',
    email: 'injetado@exemplo.test',
    password: 'Senha@123',
    role: 'ADMIN',
  })
}

describe('isDemoMode', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('liga só com "true" e desliga com "false" ou vazio', () => {
    vi.stubEnv('DEMO_MODE', 'true')
    expect(isDemoMode()).toBe(true)

    for (const value of ['', 'false']) {
      vi.stubEnv('DEMO_MODE', value)
      expect(isDemoMode(), `DEMO_MODE=${JSON.stringify(value)}`).toBe(false)
    }
  })

  it.each(['TRUE', 'True', '1', ' true', 'true ', 'yes', 'on', '0'])(
    'lança erro para valor não reconhecido (%j) em vez de desligar em silêncio',
    (value) => {
      vi.stubEnv('DEMO_MODE', value)

      expect(() => isDemoMode()).toThrow('DEMO_MODE inválido')
    },
  )

  it('é falso quando DEMO_MODE não está definido', () => {
    vi.stubEnv('DEMO_MODE', undefined)

    expect(isDemoMode()).toBe(false)
  })
})

describe('setup de plataforma (PLATFORM_SETUP_SECRET)', () => {
  let tenant: TestTenant

  beforeEach(async () => {
    vi.stubEnv('DEMO_MODE', undefined)
    tenant = await createTestTenant('condominio-a')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('fora do modo demo (comportamento normal)', () => {
    it('PATCH /condominiums/me troca o slug normalmente', async () => {
      const response = await request(app)
        .patch('/api/condominiums/me')
        .set('Authorization', authHeader(tenant.admin))
        .send({ slug: 'outro-slug' })

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({ slug: 'outro-slug' })
    })

    it('POST /condominiums cria o condomínio com o segredo correto', async () => {
      const response = await createCondominium(VALID_SECRET)

      expect(response.status).toBe(201)
      expect(await prisma.condominium.count({ where: { slug: 'condominio-novo' } })).toBe(1)
    })

    it('POST /condominiums responde 401 sem segredo ou com segredo errado', async () => {
      expect((await createCondominium()).status).toBe(401)
      expect((await createCondominium('segredo-errado')).status).toBe(401)
      expect(await prisma.condominium.count({ where: { slug: 'condominio-novo' } })).toBe(0)
    })

    it('POST /auth/register cria o primeiro usuário com o segredo, sem sessão', async () => {
      const response = await bootstrapUser(tenant.condominiumId, VALID_SECRET)

      expect(response.status).toBe(201)
      expect(await prisma.user.count({ where: { email: 'injetado@exemplo.test' } })).toBe(1)
    })
  })

  describe('com DEMO_MODE=true', () => {
    beforeEach(() => {
      vi.stubEnv('DEMO_MODE', 'true')
    })

    it('POST /condominiums responde 403 mesmo com o segredo correto e não cria nada', async () => {
      const before = await prisma.condominium.count()

      const response = await createCondominium(VALID_SECRET)

      expect(response.status).toBe(403)
      expect(response.body).toEqual({ error: DEMO_SETUP_DISABLED_MESSAGE })
      expect(await prisma.condominium.count()).toBe(before)
    })

    it('POST /condominiums dá a mesma resposta com segredo errado ou ausente (não vira oráculo)', async () => {
      const correct = await createCondominium(VALID_SECRET)
      const wrong = await createCondominium('segredo-errado')
      const missing = await createCondominium()

      expect(wrong.status).toBe(correct.status)
      expect(missing.status).toBe(correct.status)
      expect(wrong.body).toEqual(correct.body)
      expect(missing.body).toEqual(correct.body)
    })

    it('POST /auth/register ignora o segredo: sem sessão, não cria usuário', async () => {
      const before = await prisma.user.count()

      const response = await bootstrapUser(tenant.condominiumId, VALID_SECRET)

      expect(response.status).toBe(401)
      expect(await prisma.user.count()).toBe(before)
      expect(await prisma.user.count({ where: { email: 'injetado@exemplo.test' } })).toBe(0)
    })

    it('o segredo também não ajuda quem está autenticado sem ser ADMIN', async () => {
      const before = await prisma.user.count()

      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', authHeader(tenant.seguranca))
        .set(SECRET_HEADER, VALID_SECRET)
        .send({
          condominiumId: tenant.condominiumId,
          name: 'Admin Injetado',
          email: 'injetado@exemplo.test',
          password: 'Senha@123',
          role: 'ADMIN',
        })

      expect(response.status).toBe(403)
      expect(await prisma.user.count()).toBe(before)
    })

    it('o ADMIN autenticado continua criando usuários no próprio tenant', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', authHeader(tenant.admin))
        .send({
          name: 'Novo Segurança',
          email: 'novo.seguranca@exemplo.test',
          password: 'Senha@123',
          role: 'SEGURANCA',
        })

      expect(response.status).toBe(201)
    })

    it('o segredo junto com uma sessão de ADMIN não muda nada: usuário nasce no tenant do token', async () => {
      const other = await createTestTenant('condominio-b')

      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', authHeader(tenant.admin))
        .set(SECRET_HEADER, VALID_SECRET)
        .send({
          condominiumId: other.condominiumId,
          name: 'Admin Injetado',
          email: 'injetado@exemplo.test',
          password: 'Senha@123',
          role: 'ADMIN',
        })

      expect(response.status).toBe(201)
      const created = await prisma.user.findMany({ where: { email: 'injetado@exemplo.test' } })
      expect(created).toHaveLength(1)
      expect(created[0]?.condominiumId).toBe(tenant.condominiumId)
      expect(await prisma.user.count({ where: { condominiumId: other.condominiumId } })).toBe(2)
    })

    it('o ADMIN não sobrescreve um usuário existente (sem troca de senha via register)', async () => {
      const existing = await prisma.user.findUniqueOrThrow({ where: { id: tenant.seguranca.id } })

      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', authHeader(tenant.admin))
        .send({
          name: 'Sobrescrito',
          email: tenant.seguranca.email,
          password: 'OutraSenha@123',
          role: 'ADMIN',
        })

      expect(response.status).toBe(409)
      const after = await prisma.user.findUniqueOrThrow({ where: { id: tenant.seguranca.id } })
      expect(after.passwordHash).toBe(existing.passwordHash)
      expect(after.role).toBe('SEGURANCA')
    })

    it('PATCH /condominiums/me não deixa trocar o slug (derrubaria o login da demo)', async () => {
      for (const slug of ['outro-slug', '', null]) {
        const response = await request(app)
          .patch('/api/condominiums/me')
          .set('Authorization', authHeader(tenant.admin))
          .send({ slug })

        expect(response.status, `slug=${JSON.stringify(slug)}`).toBe(403)
        expect(response.body).toEqual({ error: DEMO_SLUG_CHANGE_DISABLED_MESSAGE })
      }

      const both = await request(app)
        .patch('/api/condominiums/me')
        .set('Authorization', authHeader(tenant.admin))
        .send({ name: 'Nome Novo', slug: 'outro-slug' })
      expect(both.status).toBe(403)

      const condominium = await prisma.condominium.findUniqueOrThrow({
        where: { id: tenant.condominiumId },
      })
      expect(condominium.slug).toBe('condominio-a')
      expect(condominium.name).toBe('Condomínio condominio-a')
    })

    it('PATCH /condominiums/me ainda permite renomear (o reset diário restaura o nome)', async () => {
      const response = await request(app)
        .patch('/api/condominiums/me')
        .set('Authorization', authHeader(tenant.admin))
        .send({ name: 'Nome Novo' })

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({ name: 'Nome Novo', slug: 'condominio-a' })
    })

    it('o que a demo precisa continua funcionando: slug público e sessão', async () => {
      const slug = await request(app).get('/api/condominiums/slug/condominio-a/id')
      expect(slug.status).toBe(200)

      const me = await request(app)
        .get('/api/condominiums/me')
        .set('Authorization', authHeader(tenant.admin))
      expect(me.status).toBe(200)
    })
  })
})
