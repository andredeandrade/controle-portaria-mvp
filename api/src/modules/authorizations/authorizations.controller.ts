import type { Request, Response } from 'express'
import { HttpError } from '../../lib/http-error.js'
import { authorizationsService } from './authorizations.service.js'
import type { UpdateAuthorizationInput } from './authorizations.types.js'

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

function parseUpdateInput(body: Record<string, unknown>): UpdateAuthorizationInput {
  const input: UpdateAuthorizationInput = {}

  if ('authorizedName' in body) {
    input.authorizedName = String(body['authorizedName'] ?? '')
  }

  if ('personType' in body) {
    input.personType = String(body['personType'] ?? '')
  }

  if ('document' in body) {
    input.document = String(body['document'] ?? '')
  }

  if ('phone' in body) {
    input.phone = readOptionalString(body['phone']) ?? null
  }

  if ('company' in body) {
    input.company = readOptionalString(body['company']) ?? null
  }

  if ('unit' in body) {
    input.unit = String(body['unit'] ?? '')
  }

  if ('authorizedBy' in body) {
    input.authorizedBy = String(body['authorizedBy'] ?? '')
  }

  if ('validFromDate' in body) {
    input.validFromDate = String(body['validFromDate'] ?? '')
  }

  if ('validFromTime' in body) {
    input.validFromTime = String(body['validFromTime'] ?? '')
  }

  if ('validToDate' in body) {
    input.validToDate = String(body['validToDate'] ?? '')
  }

  if ('validToTime' in body) {
    input.validToTime = String(body['validToTime'] ?? '')
  }

  if ('observations' in body) {
    input.observations = readOptionalString(body['observations']) ?? null
  }

  return input
}

export const authorizationsController = {
  async create(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const body = getBodyAsRecord(req.body)

    const authorization = await authorizationsService.create({
      condominiumId: req.authUser.condominiumId,
      authorizedName: String(body['authorizedName'] ?? ''),
      personType: String(body['personType'] ?? ''),
      document: String(body['document'] ?? ''),
      phone: readOptionalString(body['phone']),
      company: readOptionalString(body['company']),
      unit: String(body['unit'] ?? ''),
      authorizedBy: String(body['authorizedBy'] ?? ''),
      validFromDate: String(body['validFromDate'] ?? ''),
      validFromTime: String(body['validFromTime'] ?? ''),
      validToDate: String(body['validToDate'] ?? ''),
      validToTime: String(body['validToTime'] ?? ''),
      observations: readOptionalString(body['observations']),
      createdByUserId: req.authUser.id,
    })

    res.status(201).json(authorization)
  },

  async list(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const result = await authorizationsService.list({
      condominiumId: req.authUser.condominiumId,
      page: Number(req.query['page'] ?? 1),
      pageSize: Number(req.query['pageSize'] ?? 10),
      search: req.query['search'] ? String(req.query['search']) : undefined,
    })

    res.json(result)
  },

  async getById(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const authorization = await authorizationsService.getById(
      String(req.params['id'] ?? ''),
      req.authUser.condominiumId,
    )

    res.json(authorization)
  },

  async update(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const body = getBodyAsRecord(req.body)

    const authorization = await authorizationsService.update(
      String(req.params['id'] ?? ''),
      parseUpdateInput(body),
      req.authUser.condominiumId,
    )

    res.json(authorization)
  },

  async remove(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    await authorizationsService.remove(String(req.params['id'] ?? ''), req.authUser.condominiumId)

    res.status(204).send()
  },
}
