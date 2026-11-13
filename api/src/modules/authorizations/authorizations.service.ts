import { decryptText, encryptText } from '../../lib/crypto.js'
import { HttpError } from '../../lib/http-error.js'
import { prisma } from '../../lib/prisma.js'
import type {
  AuthorizationResponse,
  CreateAuthorizationInput,
  ListAuthorizationsInput,
  UpdateAuthorizationInput,
} from './authorizations.types.js'

const PAGE_MIN = 1
const PAGE_SIZE_MIN = 1
const PAGE_SIZE_MAX = 100

const PERSON_TYPES = new Set<string>(['morador', 'visitante', 'prestador_servico'])

function normalizeOptionalText(value: string | null | undefined): string | null {
  if (value === undefined || value === null) {
    return null
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function validateDate(date: string, fieldName: string): string {
  const normalized = date.trim()

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new HttpError(400, `${fieldName} inválida.`)
  }

  return normalized
}

function validateTime(time: string, fieldName: string): string {
  const normalized = time.trim()

  if (!/^\d{2}:\d{2}$/.test(normalized)) {
    throw new HttpError(400, `${fieldName} inválida.`)
  }

  return normalized
}

function validatePersonType(personType: string): string {
  const normalized = personType.trim()

  if (!PERSON_TYPES.has(normalized)) {
    throw new HttpError(400, 'Tipo de pessoa inválido.')
  }

  return normalized
}

function ensureDateTimeRange(
  validFromDate: string,
  validFromTime: string,
  validToDate: string,
  validToTime: string,
) {
  if (validToDate < validFromDate) {
    throw new HttpError(400, 'Período final deve ser maior ou igual ao período inicial.')
  }

  if (validToDate === validFromDate && validToTime < validFromTime) {
    throw new HttpError(400, 'Período final deve ser maior ou igual ao período inicial.')
  }
}

function validateCreateInput(input: CreateAuthorizationInput): {
  authorizedName: string
  personType: string
  document: string
  phone: string | null
  company: string | null
  unit: string
  authorizedBy: string
  validFromDate: string
  validFromTime: string
  validToDate: string
  validToTime: string
  observations: string | null
} {
  const authorizedName = input.authorizedName.trim()
  const personType = validatePersonType(input.personType)
  const document = normalizeOptionalText(input.document)
  const phone = normalizeOptionalText(input.phone)
  const company = normalizeOptionalText(input.company)
  const unit = input.unit.trim()
  const authorizedBy = input.authorizedBy.trim()
  const validFromDate = validateDate(input.validFromDate, 'Data inicial')
  const validFromTime = validateTime(input.validFromTime, 'Hora inicial')
  const validToDate = validateDate(input.validToDate, 'Data final')
  const validToTime = validateTime(input.validToTime, 'Hora final')
  const observations = normalizeOptionalText(input.observations)

  if (authorizedName.length < 3) {
    throw new HttpError(400, 'Nome do autorizado deve ter ao menos 3 caracteres.')
  }

  if (!document || document.length < 5) {
    throw new HttpError(400, 'Documento inválido.')
  }

  if (!unit) {
    throw new HttpError(400, 'Unidade é obrigatória.')
  }

  if (authorizedBy.length < 3) {
    throw new HttpError(400, 'Autorizado por deve ter ao menos 3 caracteres.')
  }

  ensureDateTimeRange(validFromDate, validFromTime, validToDate, validToTime)

  return {
    authorizedName,
    personType,
    document,
    phone,
    company,
    unit,
    authorizedBy,
    validFromDate,
    validFromTime,
    validToDate,
    validToTime,
    observations,
  }
}

function validateUpdateInput(input: UpdateAuthorizationInput): {
  authorizedName?: string
  personType?: string
  document?: string
  phone?: string | null
  company?: string | null
  unit?: string
  authorizedBy?: string
  validFromDate?: string
  validFromTime?: string
  validToDate?: string
  validToTime?: string
  observations?: string | null
} {
  const data: {
    authorizedName?: string
    personType?: string
    document?: string
    phone?: string | null
    company?: string | null
    unit?: string
    authorizedBy?: string
    validFromDate?: string
    validFromTime?: string
    validToDate?: string
    validToTime?: string
    observations?: string | null
  } = {}

  if (input.authorizedName !== undefined) {
    const authorizedName = input.authorizedName.trim()

    if (authorizedName.length < 3) {
      throw new HttpError(400, 'Nome do autorizado deve ter ao menos 3 caracteres.')
    }

    data.authorizedName = authorizedName
  }

  if (input.personType !== undefined) {
    data.personType = validatePersonType(input.personType)
  }

  if (input.document !== undefined) {
    const document = normalizeOptionalText(input.document)

    if (!document || document.length < 5) {
      throw new HttpError(400, 'Documento inválido.')
    }

    data.document = document
  }

  if (input.phone !== undefined) {
    data.phone = normalizeOptionalText(input.phone)
  }

  if (input.company !== undefined) {
    data.company = normalizeOptionalText(input.company)
  }

  if (input.unit !== undefined) {
    const unit = input.unit.trim()

    if (!unit) {
      throw new HttpError(400, 'Unidade é obrigatória.')
    }

    data.unit = unit
  }

  if (input.authorizedBy !== undefined) {
    const authorizedBy = input.authorizedBy.trim()

    if (authorizedBy.length < 3) {
      throw new HttpError(400, 'Autorizado por deve ter ao menos 3 caracteres.')
    }

    data.authorizedBy = authorizedBy
  }

  if (input.validFromDate !== undefined) {
    data.validFromDate = validateDate(input.validFromDate, 'Data inicial')
  }

  if (input.validFromTime !== undefined) {
    data.validFromTime = validateTime(input.validFromTime, 'Hora inicial')
  }

  if (input.validToDate !== undefined) {
    data.validToDate = validateDate(input.validToDate, 'Data final')
  }

  if (input.validToTime !== undefined) {
    data.validToTime = validateTime(input.validToTime, 'Hora final')
  }

  if (input.observations !== undefined) {
    data.observations = normalizeOptionalText(input.observations)
  }

  if (Object.keys(data).length === 0) {
    throw new HttpError(400, 'Nenhum campo válido para atualização foi enviado.')
  }

  return data
}

function parsePagination(input: ListAuthorizationsInput): {
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

function toResponse(authorization: {
  id: string
  authorizedName: string
  personType: string
  documentEncrypted: string
  phoneEncrypted: string | null
  company: string | null
  unit: string
  authorizedBy: string
  validFromDate: string
  validFromTime: string
  validToDate: string
  validToTime: string
  observationsEncrypted: string | null
  createdByUserId: string | null
  createdAt: Date
  updatedAt: Date
}): AuthorizationResponse {
  return {
    id: authorization.id,
    authorizedName: authorization.authorizedName,
    personType: authorization.personType,
    document: decryptText(authorization.documentEncrypted),
    phone: authorization.phoneEncrypted ? decryptText(authorization.phoneEncrypted) : null,
    company: authorization.company,
    unit: authorization.unit,
    authorizedBy: authorization.authorizedBy,
    validFromDate: authorization.validFromDate,
    validFromTime: authorization.validFromTime,
    validToDate: authorization.validToDate,
    validToTime: authorization.validToTime,
    observations: authorization.observationsEncrypted
      ? decryptText(authorization.observationsEncrypted)
      : null,
    createdByUserId: authorization.createdByUserId,
    createdAt: authorization.createdAt,
    updatedAt: authorization.updatedAt,
  }
}

export const authorizationsService = {
  async create(input: CreateAuthorizationInput): Promise<AuthorizationResponse> {
    const validated = validateCreateInput(input)

    const authorization = await prisma.authorization.create({
      data: {
        condominiumId: input.condominiumId,
        authorizedName: validated.authorizedName,
        personType: validated.personType,
        documentEncrypted: encryptText(validated.document),
        phoneEncrypted: validated.phone ? encryptText(validated.phone) : null,
        company: validated.company,
        unit: validated.unit,
        authorizedBy: validated.authorizedBy,
        validFromDate: validated.validFromDate,
        validFromTime: validated.validFromTime,
        validToDate: validated.validToDate,
        validToTime: validated.validToTime,
        observationsEncrypted: validated.observations ? encryptText(validated.observations) : null,
        createdByUserId: input.createdByUserId,
      },
    })

    return toResponse(authorization)
  },

  async list(input: ListAuthorizationsInput) {
    const { page, pageSize, skip, search } = parsePagination(input)

    const where = {
      condominiumId: input.condominiumId,
      ...(search
        ? {
            OR: [
              { authorizedName: { contains: search, mode: 'insensitive' as const } },
              { personType: { contains: search, mode: 'insensitive' as const } },
              { unit: { contains: search, mode: 'insensitive' as const } },
              { authorizedBy: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    }

    const [items, total] = await prisma.$transaction([
      prisma.authorization.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ validFromDate: 'desc' }, { validFromTime: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.authorization.count({ where }),
    ])

    return {
      items: items.map((authorization) => toResponse(authorization)),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    }
  },

  async getById(id: string, condominiumId: string): Promise<AuthorizationResponse> {
    const authorizationId = id.trim()

    if (!authorizationId) {
      throw new HttpError(400, 'ID da autorização é obrigatório.')
    }

    const authorization = await prisma.authorization.findFirst({
      where: {
        id: authorizationId,
        condominiumId,
      },
    })

    if (!authorization) {
      throw new HttpError(404, 'Autorização não encontrada.')
    }

    return toResponse(authorization)
  },

  async update(
    id: string,
    input: UpdateAuthorizationInput,
    condominiumId: string,
  ): Promise<AuthorizationResponse> {
    const authorizationId = id.trim()

    if (!authorizationId) {
      throw new HttpError(400, 'ID da autorização é obrigatório.')
    }

    const exists = await prisma.authorization.findFirst({
      where: {
        id: authorizationId,
        condominiumId,
      },
      select: {
        id: true,
        validFromDate: true,
        validFromTime: true,
        validToDate: true,
        validToTime: true,
      },
    })

    if (!exists) {
      throw new HttpError(404, 'Autorização não encontrada.')
    }

    const validated = validateUpdateInput(input)

    const validFromDate = validated.validFromDate ?? exists.validFromDate
    const validFromTime = validated.validFromTime ?? exists.validFromTime
    const validToDate = validated.validToDate ?? exists.validToDate
    const validToTime = validated.validToTime ?? exists.validToTime

    ensureDateTimeRange(validFromDate, validFromTime, validToDate, validToTime)

    const authorization = await prisma.authorization.update({
      where: { id: authorizationId },
      data: {
        authorizedName: validated.authorizedName,
        personType: validated.personType,
        documentEncrypted:
          validated.document === undefined ? undefined : encryptText(validated.document),
        phoneEncrypted:
          validated.phone === undefined
            ? undefined
            : validated.phone
              ? encryptText(validated.phone)
              : null,
        company: validated.company,
        unit: validated.unit,
        authorizedBy: validated.authorizedBy,
        validFromDate: validated.validFromDate,
        validFromTime: validated.validFromTime,
        validToDate: validated.validToDate,
        validToTime: validated.validToTime,
        observationsEncrypted:
          validated.observations === undefined
            ? undefined
            : validated.observations
              ? encryptText(validated.observations)
              : null,
      },
    })

    return toResponse(authorization)
  },

  async remove(id: string, condominiumId: string): Promise<void> {
    const authorizationId = id.trim()

    if (!authorizationId) {
      throw new HttpError(400, 'ID da autorização é obrigatório.')
    }

    const exists = await prisma.authorization.findFirst({
      where: {
        id: authorizationId,
        condominiumId,
      },
      select: { id: true },
    })

    if (!exists) {
      throw new HttpError(404, 'Autorização não encontrada.')
    }

    await prisma.authorization.delete({
      where: { id: authorizationId },
    })
  },
}
