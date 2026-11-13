import type { NextFunction, Request, Response } from 'express'
import { HttpError } from '../lib/http-error.js'
import { hasValidPlatformSecret } from '../lib/platform-secret.js'

export function requirePlatformSecret(req: Request, _res: Response, next: NextFunction): void {
  if (!hasValidPlatformSecret(req.headers['x-platform-setup-secret'])) {
    throw new HttpError(401, 'Não autorizado.')
  }

  next()
}
