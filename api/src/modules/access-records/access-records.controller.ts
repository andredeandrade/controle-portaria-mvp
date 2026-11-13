import type { Request, Response } from 'express'
import { HttpError } from '../../lib/http-error.js'
import { accessRecordsService } from './access-records.service.js'
import type { AccessRecordListStatus, AccessRecordPersonInput } from './access-records.types.js'

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

function parsePeople(value: unknown): AccessRecordPersonInput[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((person) => {
    if (!person || typeof person !== 'object') {
      return {
        category: '',
        name: '',
        document: '',
        unit: '',
      }
    }

    const personRecord = person as Record<string, unknown>

    return {
      category: String(personRecord['category'] ?? ''),
      name: String(personRecord['name'] ?? ''),
      document: readOptionalString(personRecord['document']),
      unit: readOptionalString(personRecord['unit']),
    }
  })
}

function parseStatus(value: unknown): AccessRecordListStatus | undefined {
  if (value === undefined) {
    return undefined
  }

  return String(value) as AccessRecordListStatus
}

function parsePersonIds(value: unknown): string[] | undefined {
  if (value === undefined) {
    return undefined
  }

  if (!Array.isArray(value)) {
    throw new HttpError(400, 'personIds deve ser um array de identificadores.')
  }

  return value.map((personId) => String(personId ?? '').trim())
}

export const accessRecordsController = {
  async checkIn(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const body = getBodyAsRecord(req.body)

    const accessRecord = await accessRecordsService.checkIn({
      condominiumId: req.authUser.condominiumId,
      people: parsePeople(body['people']),
      company: readOptionalString(body['company']),
      locomotion: readOptionalString(body['locomotion']),
      color: readOptionalString(body['color']),
      plate: readOptionalString(body['plate']),
      brandModel: readOptionalString(body['brandModel']),
      observations: readOptionalString(body['observations']),
      checkedInByUserId: req.authUser.id,
    })

    res.status(201).json(accessRecord)
  },

  async checkOut(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const body = getBodyAsRecord(req.body)

    const accessRecord = await accessRecordsService.checkOut(
      String(req.params['id'] ?? ''),
      {
        observations: readOptionalString(body['observations']) ?? null,
        personIds: parsePersonIds(body['personIds']),
        checkedOutByUserId: req.authUser.id,
      },
      req.authUser.condominiumId,
    )

    res.json(accessRecord)
  },

  async list(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const result = await accessRecordsService.list({
      condominiumId: req.authUser.condominiumId,
      page: Number(req.query['page'] ?? 1),
      pageSize: Number(req.query['pageSize'] ?? 10),
      search: req.query['search'] ? String(req.query['search']) : undefined,
      status: parseStatus(req.query['status']),
    })

    res.json(result)
  },

  async getById(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const accessRecord = await accessRecordsService.getById(
      String(req.params['id'] ?? ''),
      req.authUser.condominiumId,
    )

    res.json(accessRecord)
  },
}
