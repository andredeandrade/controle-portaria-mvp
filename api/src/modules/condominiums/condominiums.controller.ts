import type { Request, Response } from 'express'
import { isDemoMode } from '../../config/env.js'
import { HttpError } from '../../lib/http-error.js'
import { condominiumsService } from './condominiums.service.js'

export const DEMO_SLUG_CHANGE_DISABLED_MESSAGE =
  'Indisponível no ambiente de demonstração: não é possível alterar o slug do condomínio.'

function getBodyAsRecord(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== 'object') {
    throw new HttpError(400, 'Corpo da requisição inválido.')
  }

  return body as Record<string, unknown>
}

function readOptionalString(value: unknown): string | undefined {
  if (value === undefined) {
    return undefined
  }

  if (value === null) {
    return ''
  }

  return String(value)
}

export const condominiumsController = {
  async create(req: Request, res: Response) {
    const body = getBodyAsRecord(req.body)

    const condominium = await condominiumsService.create({
      name: String(body['name'] ?? ''),
      slug: readOptionalString(body['slug']),
    })

    res.status(201).json(condominium)
  },

  async me(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const condominium = await condominiumsService.getById(req.authUser.condominiumId)

    res.json(condominium)
  },

  async getIdBySlug(req: Request, res: Response) {
    const slug = String(req.params['slug'] ?? '')
    const condominium = await condominiumsService.getIdBySlug(slug)

    res.json(condominium)
  },

  async updateMe(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const body = getBodyAsRecord(req.body)
    const slug = readOptionalString(body['slug'])

    // Na demo o slug é o endereço do único tenant: trocá-lo derruba o login de todos.
    if (isDemoMode() && slug !== undefined) {
      throw new HttpError(403, DEMO_SLUG_CHANGE_DISABLED_MESSAGE)
    }

    const condominium = await condominiumsService.updateOwn(req.authUser.condominiumId, {
      name: readOptionalString(body['name']),
      slug,
    })

    res.json(condominium)
  },
}
