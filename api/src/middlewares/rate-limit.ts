import { rateLimit } from 'express-rate-limit'
import { env } from '../config/env.js'

const tooManyRequests = { error: 'Muitas requisições. Tente novamente em instantes.' }

/** Limite global por IP aplicado a todas as rotas /api. */
export const apiRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  limit: env.rateLimitMax,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: tooManyRequests,
})

/** Limite estrito para autenticação (mitiga força bruta); só conta tentativas com falha. */
export const authRateLimiter = rateLimit({
  windowMs: env.authRateLimitWindowMs,
  limit: env.authRateLimitMax,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: tooManyRequests,
})
