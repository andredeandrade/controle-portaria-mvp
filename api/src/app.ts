/**
 * Configura a aplicação Express:
 * - Middlewares globais (JSON, CORS)
 * - Prefixo /api para todas as rotas
 * - Tratamento de rotas não encontradas (404)
 * - Tratamento centralizado de erros
 *
 * Separado de server.ts para facilitar testes futuros
 * (importar app sem subir o servidor).
 */

import 'dotenv/config'

import express, { type Request, type Response, type NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { env } from './config/env.js'
import { healthRouter } from './modules/health/index.js'
import { router } from './routes/index.js'
import { HttpError } from './lib/http-error.js'
import { apiRateLimiter } from './middlewares/rate-limit.js'

export const app = express()

// ── Middlewares globais ──────────────────────────────────────────────────────

app.disable('x-powered-by')
// Necessário para req.ip correto (rate limit) atrás de proxy/load balancer
app.set('trust proxy', env.trustProxy)

// Headers de segurança (HSTS, nosniff, frameguard etc.)
app.use(helmet())

// Libera chamadas vindas do frontend
app.use(
  cors({
    origin: env.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)

// Health checks: fora de /api de propósito, então ficam fora do rate limiter abaixo e sem auth.
app.use('/health', healthRouter)

// Limite global de requisições por IP
app.use('/api', apiRateLimiter)

// Habilita leitura de JSON no body das requisições (com limite de tamanho)
app.use(express.json({ limit: env.bodyLimit }))

// ── Rotas ────────────────────────────────────────────────────────────────────

app.use('/api', router)

// ── 404 ──────────────────────────────────────────────────────────────────────

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota não encontrada.' })
})

// ── Tratamento centralizado de erros ─────────────────────────────────────────
// Express 5 encaminha automaticamente erros de async para cá
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ error: err.message })
    return
  }

  // Erros do body-parser (JSON inválido, body grande demais) trazem status 4xx
  const status = (err as { status?: unknown }).status
  if (typeof status === 'number' && status >= 400 && status < 500) {
    res.status(status).json({
      error: status === 413 ? 'Corpo da requisição muito grande.' : 'Requisição inválida.',
    })
    return
  }

  res.status(500).json({
    error: env.nodeEnv === 'production' ? 'Erro interno do servidor.' : err.message,
  })
})
