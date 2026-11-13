import type { Request, Response } from 'express'
import { HttpError } from '../../lib/http-error.js'
import { serviceProvidersService } from './service-providers.service.js'
import type { UpdateServiceProviderInput } from './service-providers.types.js'

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

function parseUpdateInput(body: Record<string, unknown>): UpdateServiceProviderInput {
  const input: UpdateServiceProviderInput = {}

  if ('companyName' in body) {
    input.companyName = String(body['companyName'] ?? '')
  }

  if ('responsibleName' in body) {
    input.responsibleName = String(body['responsibleName'] ?? '')
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

  if ('serviceType' in body) {
    input.serviceType = String(body['serviceType'] ?? '')
  }

  if ('unit' in body) {
    input.unit = readOptionalString(body['unit']) ?? null
  }

  if ('authorizedBy' in body) {
    input.authorizedBy = String(body['authorizedBy'] ?? '')
  }

  if ('observations' in body) {
    input.observations = readOptionalString(body['observations']) ?? null
  }

  return input
}

export const serviceProvidersController = {
  async create(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const body = getBodyAsRecord(req.body)

    const serviceProvider = await serviceProvidersService.create({
      condominiumId: req.authUser.condominiumId,
      companyName: String(body['companyName'] ?? ''),
      responsibleName: String(body['responsibleName'] ?? ''),
      document: String(body['document'] ?? ''),
      phone: readOptionalString(body['phone']),
      email: readOptionalString(body['email']),
      serviceType: String(body['serviceType'] ?? ''),
      unit: readOptionalString(body['unit']),
      authorizedBy: String(body['authorizedBy'] ?? ''),
      observations: readOptionalString(body['observations']),
      vehiclePlate: readOptionalString(body['vehiclePlate']),
      vehicleBrandModel: readOptionalString(body['vehicleBrandModel']),
      vehicleColor: readOptionalString(body['vehicleColor']),
      createdByUserId: req.authUser.id,
    })

    res.status(201).json(serviceProvider)
  },

  async list(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const result = await serviceProvidersService.list({
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

    const serviceProvider = await serviceProvidersService.getById(
      String(req.params['id'] ?? ''),
      req.authUser.condominiumId,
    )

    res.json(serviceProvider)
  },

  async update(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const body = getBodyAsRecord(req.body)

    const serviceProvider = await serviceProvidersService.update(
      String(req.params['id'] ?? ''),
      parseUpdateInput(body),
      req.authUser.condominiumId,
    )

    res.json(serviceProvider)
  },

  async remove(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    await serviceProvidersService.remove(String(req.params['id'] ?? ''), req.authUser.condominiumId)

    res.status(204).send()
  },
}
