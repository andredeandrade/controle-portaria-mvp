import { Router } from 'express'
import { healthController } from './health.controller.js'

/**
 * Montado em `/health` (fora de `/api`, portanto fora do rate limiter global e sem auth).
 * Públicos de propósito e sem informação sensível: servem ao healthcheck do Docker, ao
 * health check do Render e a quem precisa acordar a API.
 *
 * - `GET /health`: liveness, sem banco. É o que um health check frequente deve usar:
 *   consultar o banco a cada poucos segundos mantém um Postgres serverless (Neon free)
 *   acordado o tempo todo e gasta as horas de computação do mês.
 * - `GET /health/ready`: readiness, com `SELECT 1`.
 */
export const healthRouter = Router()

healthRouter.get('/', healthController.live)
healthRouter.get('/ready', healthController.ready)
