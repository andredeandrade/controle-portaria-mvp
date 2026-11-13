import type { Request, Response } from 'express'
import { HttpError } from '../../lib/http-error.js'
import { residentsService } from './residents.service.js'
import type { UpdateResidentInput, VehicleInput } from './residents.types.js'

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

function parseVehicles(value: unknown): VehicleInput[] | undefined {
  if (value === undefined) {
    return undefined
  }

  if (!Array.isArray(value)) {
    throw new HttpError(400, 'Campo vehicles deve ser uma lista.')
  }

  return value.map((vehicle) => {
    if (!vehicle || typeof vehicle !== 'object') {
      throw new HttpError(400, 'Cada veículo deve ser um objeto válido.')
    }

    const vehicleRecord = vehicle as Record<string, unknown>

    return {
      type: String(vehicleRecord['type'] ?? '') as VehicleInput['type'],
      color: readOptionalString(vehicleRecord['color']),
      plate: readOptionalString(vehicleRecord['plate']),
      brandModel: readOptionalString(vehicleRecord['brandModel']),
    }
  })
}

/**
 * Lê as unidades do morador. Aceita `units` (lista) e, por compatibilidade,
 * `unit` (texto único).
 */
function parseUnits(body: Record<string, unknown>): string[] | undefined {
  if ('units' in body) {
    const value = body['units']

    if (!Array.isArray(value)) {
      throw new HttpError(400, 'Campo units deve ser uma lista.')
    }

    return value.map((unit) => String(unit ?? ''))
  }

  if ('unit' in body) {
    return [String(body['unit'] ?? '')]
  }

  return undefined
}

function parseUpdateInput(body: Record<string, unknown>): UpdateResidentInput {
  const input: UpdateResidentInput = {}

  if ('fullName' in body) {
    input.fullName = String(body['fullName'] ?? '')
  }

  const units = parseUnits(body)

  if (units !== undefined) {
    input.units = units
  }

  if ('relation' in body) {
    input.relation = String(body['relation'] ?? '') as UpdateResidentInput['relation']
  }

  if ('email' in body) {
    input.email = readOptionalString(body['email']) ?? null
  }

  if ('phone' in body) {
    input.phone = readOptionalString(body['phone']) ?? null
  }

  if ('document' in body) {
    input.document = readOptionalString(body['document']) ?? null
  }

  if ('observations' in body) {
    input.observations = readOptionalString(body['observations']) ?? null
  }

  if ('vehicles' in body) {
    input.vehicles = parseVehicles(body['vehicles'])
  }

  return input
}

export const residentsController = {
  async create(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const body = getBodyAsRecord(req.body)

    const resident = await residentsService.create({
      condominiumId: req.authUser.condominiumId,
      fullName: String(body['fullName'] ?? ''),
      units: parseUnits(body) ?? [],
      relation: String(body['relation'] ?? '') as 'proprietario' | 'inquilino' | 'dependente',
      email: readOptionalString(body['email']),
      phone: readOptionalString(body['phone']),
      document: String(body['document'] ?? ''),
      observations: readOptionalString(body['observations']),
      vehicles: parseVehicles(body['vehicles']),
      createdByUserId: req.authUser.id,
    })

    res.status(201).json(resident)
  },

  async list(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const result = await residentsService.list({
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

    const resident = await residentsService.getById(
      String(req.params['id'] ?? ''),
      req.authUser.condominiumId,
    )
    res.json(resident)
  },

  async update(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const body = getBodyAsRecord(req.body)
    const resident = await residentsService.update(
      String(req.params['id'] ?? ''),
      parseUpdateInput(body),
      req.authUser.condominiumId,
    )

    res.json(resident)
  },

  async remove(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    await residentsService.remove(String(req.params['id'] ?? ''), req.authUser.condominiumId)

    res.status(204).send()
  },
}
