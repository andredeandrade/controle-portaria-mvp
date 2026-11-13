import type { NextFunction, Request, Response } from 'express'
import type { UserRole } from '../lib/jwt.js'
import { HttpError } from '../lib/http-error.js'
import { hasPermission, type ResourceActionMap } from '../lib/permissions.js'

export function authorizeRoles(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    if (!roles.includes(req.authUser.role)) {
      throw new HttpError(403, 'Você não tem permissão para acessar este recurso.')
    }

    next()
  }
}

export function authorizePermission<Resource extends keyof ResourceActionMap>(
  resource: Resource,
  action: ResourceActionMap[Resource],
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    if (!hasPermission(req.authUser.role, resource, action)) {
      throw new HttpError(403, 'Você não tem permissão para acessar este recurso.')
    }

    next()
  }
}
