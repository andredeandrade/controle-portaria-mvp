import type { NextFunction, Request, Response } from 'express'
import { isDemoMode } from '../config/env.js'
import { HttpError } from '../lib/http-error.js'
import { hasValidPlatformSecret } from '../lib/platform-secret.js'

export const DEMO_SETUP_DISABLED_MESSAGE =
  'Indisponível no ambiente de demonstração: não é possível criar condomínios.'

export function requirePlatformSecret(req: Request, _res: Response, next: NextFunction): void {
  // Antes de olhar o header: na demo a resposta não depende de o segredo estar certo,
  // então a rota não serve de oráculo para descobri-lo.
  if (isDemoMode()) {
    throw new HttpError(403, DEMO_SETUP_DISABLED_MESSAGE)
  }

  if (!hasValidPlatformSecret(req.headers['x-platform-setup-secret'])) {
    throw new HttpError(401, 'Não autorizado.')
  }

  next()
}
