import request from 'supertest'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { app } from '../../app.js'
import { DEMO_PASSWORD, DEMO_USERS } from '../../lib/demo-users.js'
import type { UserRole } from '../../lib/jwt.js'
import { hashPassword } from '../../lib/password.js'
import { prisma } from '../../lib/prisma.js'

type Method = 'get' | 'post' | 'patch' | 'delete'

const ALL: readonly UserRole[] = ['ADMIN', 'GESTOR', 'SINDICO', 'SEGURANCA']
/** Gestão do condomínio: tudo nos cadastros, mas sem operar a portaria. */
const MANAGEMENT: readonly UserRole[] = ['ADMIN', 'GESTOR', 'SINDICO']
/** Operam a portaria: registram entradas e saídas. */
const FRONT_DESK: readonly UserRole[] = ['ADMIN', 'GESTOR', 'SEGURANCA']

/** UUID válido que não existe: o 403 vem antes da busca; quem passa recebe 400/404. */
const MISSING_ID = '00000000-0000-4000-8000-000000000000'

interface RouteExpectation {
  method: Method
  path: string
  /** Perfis que PODEM chamar a rota. Escrito à mão, de propósito: não deriva de `permissions.ts`. */
  allowed: readonly UserRole[]
}

function crud(resource: string, writers: readonly UserRole[]): RouteExpectation[] {
  return [
    { method: 'get', path: `/api/${resource}`, allowed: ALL },
    { method: 'get', path: `/api/${resource}/${MISSING_ID}`, allowed: ALL },
    { method: 'post', path: `/api/${resource}`, allowed: writers },
    { method: 'patch', path: `/api/${resource}/${MISSING_ID}`, allowed: writers },
    { method: 'delete', path: `/api/${resource}/${MISSING_ID}`, allowed: writers },
  ]
}

const ROUTES: readonly RouteExpectation[] = [
  ...crud('residents', MANAGEMENT),
  ...crud('visitors', MANAGEMENT),
  ...crud('service-providers', MANAGEMENT),
  ...crud('authorizations', MANAGEMENT),
  ...crud('events', MANAGEMENT),
  { method: 'post', path: `/api/events/${MISSING_ID}/guests`, allowed: ALL },
  { method: 'post', path: `/api/events/${MISSING_ID}/access`, allowed: ALL },
  // Ocorrências: a portaria registra (create) e consulta, mas não edita nem apaga.
  { method: 'get', path: '/api/incidents', allowed: ALL },
  { method: 'post', path: '/api/incidents', allowed: ALL },
  { method: 'patch', path: `/api/incidents/${MISSING_ID}`, allowed: MANAGEMENT },
  { method: 'delete', path: `/api/incidents/${MISSING_ID}`, allowed: MANAGEMENT },
  // Acessos: o síndico só acompanha; entrada e saída são da portaria.
  { method: 'get', path: '/api/access-records', allowed: ALL },
  { method: 'post', path: '/api/access-records/check-in', allowed: FRONT_DESK },
  { method: 'post', path: `/api/access-records/${MISSING_ID}/check-out`, allowed: FRONT_DESK },
  // Relatórios: a portaria não tem acesso.
  { method: 'get', path: '/api/reports/dashboard-summary', allowed: MANAGEMENT },
  { method: 'get', path: '/api/reports/accesses', allowed: MANAGEMENT },
  { method: 'get', path: '/api/reports/residents', allowed: MANAGEMENT },
  // Área exclusiva do ADMIN.
  { method: 'get', path: '/api/auth/admin-area', allowed: ['ADMIN'] },
]

describe('usuários da demo: login e matriz de permissões', () => {
  let condominiumId: string
  let passwordHash: string

  beforeAll(async () => {
    passwordHash = await hashPassword(DEMO_PASSWORD)
  })

  beforeEach(async () => {
    const condominium = await prisma.condominium.create({
      data: { name: 'Condomínio Demo', slug: 'demo' },
    })
    condominiumId = condominium.id

    await prisma.user.createMany({
      data: DEMO_USERS.map((user) => ({ ...user, condominiumId, passwordHash })),
    })
  })

  async function login(email: string, password: string = DEMO_PASSWORD) {
    return request(app).post('/api/auth/login').send({ condominiumId, email, password })
  }

  describe.each(DEMO_USERS)('$role ($email)', ({ role, email }) => {
    it('faz login com a senha da demo e o token identifica o perfil', async () => {
      const response = await login(email)

      expect(response.status).toBe(200)
      expect(response.body.user).toMatchObject({ email, role, condominiumId })

      const me = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${response.body.token}`)

      expect(me.status).toBe(200)
      expect(me.body.user ?? me.body).toMatchObject({ email, role })
    })

    it('rejeita a senha errada', async () => {
      const response = await login(email, 'senha-errada')

      expect(response.status).toBe(401)
      expect(response.body.token).toBeUndefined()
    })

    it('só acessa as rotas que a matriz permite para o perfil', async () => {
      const { body } = await login(email)
      const mismatches: string[] = []

      for (const route of ROUTES) {
        const response = await request(app)
          [route.method](route.path)
          .set('Authorization', `Bearer ${body.token}`)
          .send({})

        const mayAccess = route.allowed.includes(role)
        const label = `${route.method.toUpperCase()} ${route.path} → ${response.status}`

        if (!mayAccess && response.status !== 403) {
          mismatches.push(`${label} (esperado 403)`)
        }
        // Autorizado: passa pela permissão. A resposta pode ser 200, 400 ou 404
        // (corpo vazio / id inexistente), nunca 401/403 nem erro de servidor.
        if (
          mayAccess &&
          (response.status === 401 || response.status === 403 || response.status >= 500)
        ) {
          mismatches.push(`${label} (esperado liberado)`)
        }
      }

      expect(mismatches).toEqual([])
    })
  })

  it('o login de um perfil não funciona em outro condomínio', async () => {
    const other = await prisma.condominium.create({ data: { name: 'Outro', slug: 'outro' } })

    const response = await request(app)
      .post('/api/auth/login')
      .send({ condominiumId: other.id, email: 'admin@demo.local', password: DEMO_PASSWORD })

    expect(response.status).toBe(401)
  })
})
