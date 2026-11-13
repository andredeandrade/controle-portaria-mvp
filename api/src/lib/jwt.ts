import jwt, { type SignOptions } from 'jsonwebtoken'
import { env } from '../config/env.js'
import { HttpError } from './http-error.js'

export type UserRole = 'ADMIN' | 'GESTOR' | 'SINDICO' | 'SEGURANCA'

export interface AuthTokenPayload {
  sub: string
  email: string
  role: UserRole
  condominiumId: string
}

export function signAccessToken(payload: AuthTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
  }

  return jwt.sign(payload, env.jwtSecret, options)
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  try {
    const decoded = jwt.verify(token, env.jwtSecret)

    if (!decoded || typeof decoded === 'string') {
      throw new HttpError(401, 'Token inválido.')
    }

    const payload = decoded as Partial<AuthTokenPayload>

    if (!payload.sub || !payload.email || !payload.role || !payload.condominiumId) {
      throw new HttpError(401, 'Token inválido.')
    }

    if (
      payload.role !== 'ADMIN' &&
      payload.role !== 'GESTOR' &&
      payload.role !== 'SINDICO' &&
      payload.role !== 'SEGURANCA'
    ) {
      throw new HttpError(401, 'Token inválido.')
    }

    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      condominiumId: payload.condominiumId,
    }
  } catch (error) {
    if (error instanceof HttpError) {
      throw error
    }

    throw new HttpError(401, 'Token inválido ou expirado.')
  }
}
