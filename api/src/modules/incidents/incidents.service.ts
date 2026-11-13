import { decryptText, encryptText } from '../../lib/crypto.js'
import { HttpError } from '../../lib/http-error.js'
import { prisma } from '../../lib/prisma.js'
import type {
  CreateIncidentInput,
  IncidentResponse,
  ListIncidentsInput,
  UpdateIncidentInput,
} from './incidents.types.js'

const PAGE_MIN = 1
const PAGE_SIZE_MIN = 1
const PAGE_SIZE_MAX = 100

const OCCURRENCE_TYPES = new Set<string>([
  'orientacao',
  'averiguacao_atitude_suspeita',
  'acesso_nao_autorizado',
  'veiculo_atitude_suspeita',
  'discussao_conflito',
  'falha_tecnica',
  'falta_energia',
  'falta_agua',
  'pertubacao_sossego',
  'incendio',
  'emergencia_medica',
  'descarte_irregular_lixo',
  'resgate_ou_invasao_animal',
  'furto',
  'roubo',
  'vandalismo',
  'outro',
])

function normalizeOptionalText(value: string | null | undefined): string | null {
  if (value === undefined || value === null) {
    return null
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function validateOccurrenceType(occurrenceType: string): string {
  const normalized = occurrenceType.trim()

  if (!OCCURRENCE_TYPES.has(normalized)) {
    throw new HttpError(400, 'Tipo de ocorrência inválido.')
  }

  return normalized
}

function validateDate(date: string): string {
  const normalized = date.trim()

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new HttpError(400, 'Data da ocorrência inválida.')
  }

  return normalized
}

function validateTime(time: string): string {
  const normalized = time.trim()

  if (!/^\d{2}:\d{2}$/.test(normalized)) {
    throw new HttpError(400, 'Hora da ocorrência inválida.')
  }

  return normalized
}

function validateCreateInput(input: CreateIncidentInput): {
  occurrenceType: string
  date: string
  time: string
  report: string
  place: string
} {
  const occurrenceType = validateOccurrenceType(input.occurrenceType)
  const date = validateDate(input.date)
  const time = validateTime(input.time)
  const report = input.report.trim()

  if (report.length < 5) {
    throw new HttpError(400, 'Relato da ocorrência deve ter ao menos 5 caracteres.')
  }

  const place = input.place.trim()

  if (!place) {
    throw new HttpError(400, 'Local da ocorrência é obrigatório.')
  }

  return {
    occurrenceType,
    date,
    time,
    report,
    place,
  }
}

function validateUpdateInput(input: UpdateIncidentInput): {
  occurrenceType?: string
  date?: string
  time?: string
  report?: string
  place?: string
} {
  const data: {
    occurrenceType?: string
    date?: string
    time?: string
    report?: string
    place?: string
  } = {}

  if (input.occurrenceType !== undefined) {
    data.occurrenceType = validateOccurrenceType(input.occurrenceType)
  }

  if (input.date !== undefined) {
    data.date = validateDate(input.date)
  }

  if (input.time !== undefined) {
    data.time = validateTime(input.time)
  }

  if (input.report !== undefined) {
    const report = normalizeOptionalText(input.report)

    if (!report) {
      throw new HttpError(400, 'Relato da ocorrência é obrigatório.')
    }

    if (report.length < 5) {
      throw new HttpError(400, 'Relato da ocorrência deve ter ao menos 5 caracteres.')
    }

    data.report = report
  }

  if (input.place !== undefined) {
    const place = normalizeOptionalText(input.place)

    if (!place) {
      throw new HttpError(400, 'Local da ocorrência é obrigatório.')
    }

    data.place = place
  }

  if (Object.keys(data).length === 0) {
    throw new HttpError(400, 'Nenhum campo válido para atualização foi enviado.')
  }

  return data
}

function parsePagination(input: ListIncidentsInput): {
  page: number
  pageSize: number
  skip: number
  search: string | undefined
} {
  const page = Number(input.page)
  const pageSize = Number(input.pageSize)

  if (!Number.isInteger(page) || page < PAGE_MIN) {
    throw new HttpError(400, 'Parâmetro page inválido.')
  }

  if (!Number.isInteger(pageSize) || pageSize < PAGE_SIZE_MIN || pageSize > PAGE_SIZE_MAX) {
    throw new HttpError(
      400,
      `Parâmetro pageSize inválido. Use entre ${PAGE_SIZE_MIN} e ${PAGE_SIZE_MAX}.`,
    )
  }

  const search = input.search?.trim() || undefined

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    search,
  }
}

function toResponse(incident: {
  id: string
  occurrenceType: string
  date: string
  time: string
  reportEncrypted: string
  placeEncrypted: string | null
  createdByUserId: string | null
  createdByUser: { name: string } | null
  createdAt: Date
  updatedAt: Date
}): IncidentResponse {
  return {
    id: incident.id,
    occurrenceType: incident.occurrenceType,
    date: incident.date,
    time: incident.time,
    report: decryptText(incident.reportEncrypted),
    place: incident.placeEncrypted ? decryptText(incident.placeEncrypted) : null,
    createdByUserId: incident.createdByUserId,
    createdByUserName: incident.createdByUser?.name ?? null,
    createdAt: incident.createdAt,
    updatedAt: incident.updatedAt,
  }
}

export const incidentsService = {
  async create(input: CreateIncidentInput): Promise<IncidentResponse> {
    const validated = validateCreateInput(input)

    const incident = await prisma.incident.create({
      data: {
        condominiumId: input.condominiumId,
        occurrenceType: validated.occurrenceType,
        date: validated.date,
        time: validated.time,
        reportEncrypted: encryptText(validated.report),
        placeEncrypted: encryptText(validated.place),
        createdByUserId: input.createdByUserId,
      },
      include: { createdByUser: { select: { name: true } } },
    })

    return toResponse(incident)
  },

  async list(input: ListIncidentsInput) {
    const { page, pageSize, skip, search } = parsePagination(input)

    const where = {
      condominiumId: input.condominiumId,
      ...(search
        ? {
            OR: [
              { occurrenceType: { contains: search, mode: 'insensitive' as const } },
              { date: { contains: search, mode: 'insensitive' as const } },
              { time: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    }

    const [items, total] = await prisma.$transaction([
      prisma.incident.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ date: 'desc' }, { time: 'desc' }, { createdAt: 'desc' }],
        include: { createdByUser: { select: { name: true } } },
      }),
      prisma.incident.count({ where }),
    ])

    return {
      items: items.map((incident) => toResponse(incident)),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    }
  },

  async getById(id: string, condominiumId: string): Promise<IncidentResponse> {
    const incidentId = id.trim()

    if (!incidentId) {
      throw new HttpError(400, 'ID da ocorrência é obrigatório.')
    }

    const incident = await prisma.incident.findFirst({
      where: {
        id: incidentId,
        condominiumId,
      },
      include: { createdByUser: { select: { name: true } } },
    })

    if (!incident) {
      throw new HttpError(404, 'Ocorrência não encontrada.')
    }

    return toResponse(incident)
  },

  async update(
    id: string,
    input: UpdateIncidentInput,
    condominiumId: string,
  ): Promise<IncidentResponse> {
    const incidentId = id.trim()

    if (!incidentId) {
      throw new HttpError(400, 'ID da ocorrência é obrigatório.')
    }

    const exists = await prisma.incident.findFirst({
      where: {
        id: incidentId,
        condominiumId,
      },
      select: { id: true },
    })

    if (!exists) {
      throw new HttpError(404, 'Ocorrência não encontrada.')
    }

    const validated = validateUpdateInput(input)

    const incident = await prisma.incident.update({
      where: { id: incidentId },
      data: {
        occurrenceType: validated.occurrenceType,
        date: validated.date,
        time: validated.time,
        reportEncrypted: validated.report === undefined ? undefined : encryptText(validated.report),
        placeEncrypted: validated.place === undefined ? undefined : encryptText(validated.place),
      },
      include: { createdByUser: { select: { name: true } } },
    })

    return toResponse(incident)
  },

  async remove(id: string, condominiumId: string): Promise<void> {
    const incidentId = id.trim()

    if (!incidentId) {
      throw new HttpError(400, 'ID da ocorrência é obrigatório.')
    }

    const exists = await prisma.incident.findFirst({
      where: {
        id: incidentId,
        condominiumId,
      },
      select: { id: true },
    })

    if (!exists) {
      throw new HttpError(404, 'Ocorrência não encontrada.')
    }

    await prisma.incident.delete({
      where: { id: incidentId },
    })
  },
}
