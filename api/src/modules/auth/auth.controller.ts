import type { Request, Response } from 'express'
import { authService } from './auth.service.js'
import { HttpError } from '../../lib/http-error.js'

function getBodyAsRecord(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== 'object') {
    throw new HttpError(400, 'Corpo da requisição inválido.')
  }

  return body as Record<string, unknown>
}

export const authController = {
  async register(req: Request, res: Response) {
    const body = getBodyAsRecord(req.body)

    const condominiumId = req.authUser
      ? req.authUser.condominiumId
      : String(body['condominiumId'] ?? '')

    const result = await authService.register({
      condominiumId,
      name: String(body['name'] ?? ''),
      email: String(body['email'] ?? ''),
      password: String(body['password'] ?? ''),
      role:
        body['role'] === 'ADMIN' ||
        body['role'] === 'GESTOR' ||
        body['role'] === 'SINDICO' ||
        body['role'] === 'SEGURANCA'
          ? body['role']
          : undefined,
    })

    res.status(201).json(result)
  },

  async login(req: Request, res: Response) {
    const body = getBodyAsRecord(req.body)

    const result = await authService.login({
      condominiumId: String(body['condominiumId'] ?? ''),
      email: String(body['email'] ?? ''),
      password: String(body['password'] ?? ''),
    })

    res.json(result)
  },

  async me(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    res.json({ user: req.authUser })
  },

  async adminArea(_req: Request, res: Response) {
    res.json({ message: 'Acesso liberado para ADMIN.' })
  },
}
