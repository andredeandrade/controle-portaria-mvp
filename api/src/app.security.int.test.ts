import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from './app.js'

describe('segurança global da API', () => {
  it('envia headers do helmet e não expõe x-powered-by', async () => {
    const res = await request(app).get('/api/rota-inexistente')
    expect(res.status).toBe(404)
    expect(res.headers['x-powered-by']).toBeUndefined()
    expect(res.headers['x-content-type-options']).toBe('nosniff')
  })

  it('rejeita body maior que o limite com 413', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@a.com', password: 'x'.repeat(200_000) })
    expect(res.status).toBe(413)
  })

  it('aplica rate limit no login após falhas repetidas', async () => {
    let last = 0
    for (let i = 0; i < 25; i++) {
      const res = await request(app).post('/api/auth/login').send({})
      last = res.status
    }
    expect(last).toBe(429)
  })
})
