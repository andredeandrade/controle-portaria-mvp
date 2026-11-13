import request from 'supertest'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { app } from '../../app.js'
import { env } from '../../config/env.js'
import { prisma } from '../../lib/prisma.js'

describe('GET /health (liveness)', () => {
  it('responde 200 { status: "ok" } sem autenticação', async () => {
    const response = await request(app).get('/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok' })
  })

  it('ignora um Authorization inválido (rota pública)', async () => {
    const response = await request(app).get('/health').set('Authorization', 'Bearer token-invalido')

    expect(response.status).toBe(200)
  })

  it('não consulta o banco (não mantém um Postgres serverless acordado)', async () => {
    const query = vi.spyOn(prisma, '$queryRaw')

    await request(app).get('/health').expect(200)

    expect(query).not.toHaveBeenCalled()
    query.mockRestore()
  })

  it('não vaza informação do ambiente', async () => {
    const response = await request(app).get('/health')

    expect(Object.keys(response.body)).toEqual(['status'])
    expect(JSON.stringify(response.body)).not.toMatch(/postgres|database|version|env/i)
  })

  it('fica fora do rate limiter global de /api', async () => {
    const calls = env.rateLimitMax + 20

    const statuses = new Set<number>()
    for (let i = 0; i < calls; i += 1) {
      statuses.add((await request(app).get('/health')).status)
    }

    expect(statuses).toEqual(new Set([200]))
    // Prova que o limite global existe e está ativo para o resto da API.
    const limited = await request(app).get('/api/auth/me')
    expect(limited.headers['ratelimit']).toBeDefined()
  })
})

describe('GET /health/ready (readiness)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('responde 200 quando o banco responde ao SELECT 1', async () => {
    const response = await request(app).get('/health/ready')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ status: 'ok', database: 'ok' })
  })

  it('responde 503 quando o banco falha, sem vazar o erro do driver', async () => {
    vi.spyOn(prisma, '$queryRaw').mockRejectedValueOnce(
      new Error('connect ECONNREFUSED 10.0.0.5:5432 (user controle)'),
    )

    const response = await request(app).get('/health/ready')

    expect(response.status).toBe(503)
    expect(response.body).toEqual({ status: 'error', database: 'unreachable' })
    expect(JSON.stringify(response.body)).not.toMatch(/ECONNREFUSED|10\.0\.0\.5|controle/)
  })

  it('é público e também fica fora do rate limiter', async () => {
    const response = await request(app).get('/health/ready').set('Authorization', 'Bearer x')

    expect(response.status).toBe(200)
    expect(response.headers['ratelimit']).toBeUndefined()
  })
})
