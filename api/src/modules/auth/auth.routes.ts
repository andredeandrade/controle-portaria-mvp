import type { NextFunction, Request, Response } from 'express'
import { Router } from 'express'
import { authController } from './auth.controller.js'
import { authenticate } from '../../middlewares/authenticate.js'
import { authorizeRoles } from '../../middlewares/authorize.js'
import { authRateLimiter } from '../../middlewares/rate-limit.js'
import { hasValidPlatformSecret } from '../../lib/platform-secret.js'

export const authRouter = Router()

/**
 * POST /register aceita dois modos:
 * - Bootstrap: header `x-platform-setup-secret` válido → cria o primeiro
 *   usuário de um condomínio novo, sem exigir sessão autenticada;
 *   `condominiumId` vem do body (ver auth.controller.ts).
 * - Normal: sem secret válido → exige um ADMIN autenticado, que só pode
 *   criar usuários dentro do próprio tenant.
 */
async function registerGate(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (hasValidPlatformSecret(req.headers['x-platform-setup-secret'])) {
    next()
    return
  }

  await authenticate(req, res, () => authorizeRoles('ADMIN')(req, res, next))
}

authRouter.post('/register', authRateLimiter, registerGate, authController.register)
authRouter.post('/login', authRateLimiter, authController.login)

authRouter.get('/me', authenticate, authController.me)
authRouter.get('/admin-area', authenticate, authorizeRoles('ADMIN'), authController.adminArea)
