import type { Request, Response } from 'express'
import { HttpError } from '../../lib/http-error.js'
import { visitorsService } from './visitors.service.js'
import type { UpdateVisitorInput } from './visitors.types.js'

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

function parseUpdateInput(body: Record<string, unknown>): UpdateVisitorInput {
  const input: UpdateVisitorInput = {}

  if ('fullName' in body) {
    input.fullName = String(body['fullName'] ?? '')
  }

  if ('document' in body) {
    input.document = String(body['document'] ?? '')
  }

  if ('phone' in body) {
    input.phone = readOptionalString(body['phone']) ?? null
  }

  if ('email' in body) {
    input.email = readOptionalString(body['email']) ?? null
  }

  if ('unit' in body) {
    input.unit = String(body['unit'] ?? '')
  }

  if ('authorizedBy' in body) {
    input.authorizedBy = String(body['authorizedBy'] ?? '')
  }

  if ('observations' in body) {
    input.observations = readOptionalString(body['observations']) ?? null
  }

  return input
}

export const visitorsController = {
  async create(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const body = getBodyAsRecord(req.body)

    const visitor = await visitorsService.create({
      condominiumId: req.authUser.condominiumId,
      fullName: String(body['fullName'] ?? ''),
      document: String(body['document'] ?? ''),
      phone: readOptionalString(body['phone']),
      email: readOptionalString(body['email']),
      unit: String(body['unit'] ?? ''),
      authorizedBy: String(body['authorizedBy'] ?? ''),
      observations: readOptionalString(body['observations']),
      vehiclePlate: readOptionalString(body['vehiclePlate']),
      vehicleBrandModel: readOptionalString(body['vehicleBrandModel']),
      vehicleColor: readOptionalString(body['vehicleColor']),
      createdByUserId: req.authUser.id,
    })

    res.status(201).json(visitor)
  },

  async list(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const result = await visitorsService.list({
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

    const visitor = await visitorsService.getById(
      String(req.params['id'] ?? ''),
      req.authUser.condominiumId,
    )

    res.json(visitor)
  },

  async update(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const body = getBodyAsRecord(req.body)

    const visitor = await visitorsService.update(
      String(req.params['id'] ?? ''),
      parseUpdateInput(body),
      req.authUser.condominiumId,
    )

    res.json(visitor)
  },

  async remove(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    await visitorsService.remove(String(req.params['id'] ?? ''), req.authUser.condominiumId)

    res.status(204).send()
  },
}
