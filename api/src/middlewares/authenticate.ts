import type { NextFunction, Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'
import { verifyAccessToken } from '../lib/jwt.js'
import { HttpError } from '../lib/http-error.js'

function extractBearerToken(authorizationHeader: string | undefined): string {
  if (!authorizationHeader) {
    throw new HttpError(401, 'Token não informado.')
  }

  const [scheme, token] = authorizationHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    throw new HttpError(401, 'Formato de token inválido.')
  }

  return token
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const token = extractBearerToken(req.headers.authorization)
  const payload = verifyAccessToken(token)

  const user = await prisma.user.findFirst({
    where: {
      id: payload.sub,
      condominiumId: payload.condominiumId,
    },
    select: {
      id: true,
      condominiumId: true,
      email: true,
      role: true,
      name: true,
    },
  })

  if (!user) {
    throw new HttpError(401, 'Usuário do token não encontrado.')
  }

  req.authUser = user
  next()
}
