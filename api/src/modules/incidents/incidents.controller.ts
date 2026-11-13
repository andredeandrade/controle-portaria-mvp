import type { Request, Response } from 'express'
import { HttpError } from '../../lib/http-error.js'
import { incidentsService } from './incidents.service.js'
import type { UpdateIncidentInput } from './incidents.types.js'

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

function parseUpdateInput(body: Record<string, unknown>): UpdateIncidentInput {
  const input: UpdateIncidentInput = {}

  if ('occurrenceType' in body) {
    input.occurrenceType = String(body['occurrenceType'] ?? '')
  }

  if ('date' in body) {
    input.date = String(body['date'] ?? '')
  }

  if ('time' in body) {
    input.time = String(body['time'] ?? '')
  }

  if ('report' in body) {
    input.report = readOptionalString(body['report']) ?? null
  }

  if ('place' in body) {
    input.place = readOptionalString(body['place'])
  }

  return input
}

export const incidentsController = {
  async create(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const body = getBodyAsRecord(req.body)

    const incident = await incidentsService.create({
      condominiumId: req.authUser.condominiumId,
      occurrenceType: String(body['occurrenceType'] ?? ''),
      date: String(body['date'] ?? ''),
      time: String(body['time'] ?? ''),
      report: String(body['report'] ?? ''),
      place: String(body['place'] ?? ''),
      createdByUserId: req.authUser.id,
    })

    res.status(201).json(incident)
  },

  async list(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const result = await incidentsService.list({
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

    const incident = await incidentsService.getById(
      String(req.params['id'] ?? ''),
      req.authUser.condominiumId,
    )

    res.json(incident)
  },

  async update(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const body = getBodyAsRecord(req.body)

    const incident = await incidentsService.update(
      String(req.params['id'] ?? ''),
      parseUpdateInput(body),
      req.authUser.condominiumId,
    )

    res.json(incident)
  },

  async remove(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    await incidentsService.remove(String(req.params['id'] ?? ''), req.authUser.condominiumId)

    res.status(204).send()
  },
}
