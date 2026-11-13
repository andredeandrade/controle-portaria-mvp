import { decryptText, encryptText } from '../../lib/crypto.js'
import { HttpError } from '../../lib/http-error.js'
import { prisma } from '../../lib/prisma.js'
import type {
  CreateVisitorInput,
  ListVisitorsInput,
  UpdateVisitorInput,
  VisitorResponse,
} from './visitors.types.js'

const PAGE_MIN = 1
const PAGE_SIZE_MIN = 1
const PAGE_SIZE_MAX = 100

function normalizeOptionalText(value: string | null | undefined): string | null {
  if (value === undefined || value === null) {
    return null
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateCreateInput(input: CreateVisitorInput): {
  fullName: string
  document: string
  phone: string | null
  email: string | null
  unit: string
  authorizedBy: string
  observations: string | null
  vehiclePlate: string | null
  vehicleBrandModel: string | null
  vehicleColor: string | null
} {
  const fullName = input.fullName.trim()
  const document = normalizeOptionalText(input.document)
  const phone = normalizeOptionalText(input.phone)
  const email = normalizeOptionalText(input.email)
  const unit = input.unit.trim()
  const authorizedBy = input.authorizedBy.trim()
  const observations = normalizeOptionalText(input.observations)
  const vehiclePlate = normalizeOptionalText(input.vehiclePlate)
  const vehicleBrandModel = normalizeOptionalText(input.vehicleBrandModel)
  const vehicleColor = normalizeOptionalText(input.vehicleColor)

  if (fullName.length < 3) {
    throw new HttpError(400, 'Nome deve ter ao menos 3 caracteres.')
  }

  if (!document) {
    throw new HttpError(400, 'Documento é obrigatório.')
  }

  if (document.length < 5) {
    throw new HttpError(400, 'Documento inválido.')
  }

  if (email && !validateEmail(email)) {
    throw new HttpError(400, 'E-mail inválido.')
  }

  if (!unit) {
    throw new HttpError(400, 'Unidade é obrigatória.')
  }

  if (authorizedBy.length < 3) {
    throw new HttpError(400, 'Autorizado por deve ter ao menos 3 caracteres.')
  }

  return {
    fullName,
    document,
    phone,
    email,
    unit,
    authorizedBy,
    observations,
    vehiclePlate,
    vehicleBrandModel,
    vehicleColor,
  }
}

function validateUpdateInput(input: UpdateVisitorInput): {
  fullName?: string
  document?: string
  phone?: string | null
  email?: string | null
  unit?: string
  authorizedBy?: string
  observations?: string | null
} {
  const data: {
    fullName?: string
    document?: string
    phone?: string | null
    email?: string | null
    unit?: string
    authorizedBy?: string
    observations?: string | null
  } = {}

  if (input.fullName !== undefined) {
    const fullName = input.fullName.trim()

    if (fullName.length < 3) {
      throw new HttpError(400, 'Nome deve ter ao menos 3 caracteres.')
    }

    data.fullName = fullName
  }

  if (input.document !== undefined) {
    const document = normalizeOptionalText(input.document)

    if (!document) {
      throw new HttpError(400, 'Documento é obrigatório.')
    }

    if (document.length < 5) {
      throw new HttpError(400, 'Documento inválido.')
    }

    data.document = document
  }

  if (input.phone !== undefined) {
    data.phone = normalizeOptionalText(input.phone)
  }

  if (input.email !== undefined) {
    const email = normalizeOptionalText(input.email)

    if (email && !validateEmail(email)) {
      throw new HttpError(400, 'E-mail inválido.')
    }

    data.email = email
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

  if (input.observations !== undefined) {
    data.observations = normalizeOptionalText(input.observations)
  }

  if (Object.keys(data).length === 0) {
    throw new HttpError(400, 'Nenhum campo válido para atualização foi enviado.')
  }

  return data
}

function parsePagination(input: ListVisitorsInput): {
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

function toResponse(visitor: {
  id: string
  fullName: string
  documentEncrypted: string
  phoneEncrypted: string | null
  emailEncrypted: string | null
  unit: string
  authorizedBy: string
  observationsEncrypted: string | null
  vehiclePlateEncrypted: string | null
  vehicleBrandModel: string | null
  vehicleColor: string | null
  createdByUserId: string | null
  createdAt: Date
  updatedAt: Date
}): VisitorResponse {
  return {
    id: visitor.id,
    fullName: visitor.fullName,
    document: decryptText(visitor.documentEncrypted),
    phone: visitor.phoneEncrypted ? decryptText(visitor.phoneEncrypted) : null,
    email: visitor.emailEncrypted ? decryptText(visitor.emailEncrypted) : null,
    unit: visitor.unit,
    authorizedBy: visitor.authorizedBy,
    observations: visitor.observationsEncrypted ? decryptText(visitor.observationsEncrypted) : null,
    vehiclePlate: visitor.vehiclePlateEncrypted ? decryptText(visitor.vehiclePlateEncrypted) : null,
    vehicleBrandModel: visitor.vehicleBrandModel,
    vehicleColor: visitor.vehicleColor,
    createdByUserId: visitor.createdByUserId,
    createdAt: visitor.createdAt,
    updatedAt: visitor.updatedAt,
  }
}

export const visitorsService = {
  async create(input: CreateVisitorInput): Promise<VisitorResponse> {
    const validated = validateCreateInput(input)

    const visitor = await prisma.visitor.create({
      data: {
        condominiumId: input.condominiumId,
        fullName: validated.fullName,
        documentEncrypted: encryptText(validated.document),
        phoneEncrypted: validated.phone ? encryptText(validated.phone) : null,
        emailEncrypted: validated.email ? encryptText(validated.email) : null,
        unit: validated.unit,
        authorizedBy: validated.authorizedBy,
        observationsEncrypted: validated.observations ? encryptText(validated.observations) : null,
        vehiclePlateEncrypted: validated.vehiclePlate ? encryptText(validated.vehiclePlate) : null,
        vehicleBrandModel: validated.vehicleBrandModel,
        vehicleColor: validated.vehicleColor,
        createdByUserId: input.createdByUserId,
      },
    })

    return toResponse(visitor)
  },

  async list(input: ListVisitorsInput) {
    const { page, pageSize, skip, search } = parsePagination(input)

    const where = {
      condominiumId: input.condominiumId,
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' as const } },
              { unit: { contains: search, mode: 'insensitive' as const } },
              { authorizedBy: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    }

    const [items, total] = await prisma.$transaction([
      prisma.visitor.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.visitor.count({ where }),
    ])

    return {
      items: items.map((visitor) => toResponse(visitor)),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    }
  },

  async getById(id: string, condominiumId: string): Promise<VisitorResponse> {
    const visitorId = id.trim()

    if (!visitorId) {
      throw new HttpError(400, 'ID do visitante é obrigatório.')
    }

    const visitor = await prisma.visitor.findFirst({
      where: {
        id: visitorId,
        condominiumId,
      },
    })

    if (!visitor) {
      throw new HttpError(404, 'Visitante não encontrado.')
    }

    return toResponse(visitor)
  },

  async update(
    id: string,
    input: UpdateVisitorInput,
    condominiumId: string,
  ): Promise<VisitorResponse> {
    const visitorId = id.trim()

    if (!visitorId) {
      throw new HttpError(400, 'ID do visitante é obrigatório.')
    }

    const validated = validateUpdateInput(input)

    const exists = await prisma.visitor.findFirst({
      where: {
        id: visitorId,
        condominiumId,
      },
      select: { id: true },
    })

    if (!exists) {
      throw new HttpError(404, 'Visitante não encontrado.')
    }

    const visitor = await prisma.visitor.update({
      where: { id: visitorId },
      data: {
        fullName: validated.fullName,
        documentEncrypted:
          validated.document === undefined ? undefined : encryptText(validated.document),
        phoneEncrypted:
          validated.phone === undefined
            ? undefined
            : validated.phone
              ? encryptText(validated.phone)
              : null,
        emailEncrypted:
          validated.email === undefined
            ? undefined
            : validated.email
              ? encryptText(validated.email)
              : null,
        unit: validated.unit,
        authorizedBy: validated.authorizedBy,
        observationsEncrypted:
          validated.observations === undefined
            ? undefined
            : validated.observations
              ? encryptText(validated.observations)
              : null,
      },
    })

    return toResponse(visitor)
  },

  async remove(id: string, condominiumId: string): Promise<void> {
    const visitorId = id.trim()

    if (!visitorId) {
      throw new HttpError(400, 'ID do visitante é obrigatório.')
    }

    const exists = await prisma.visitor.findFirst({
      where: {
        id: visitorId,
        condominiumId,
      },
      select: { id: true },
    })

    if (!exists) {
      throw new HttpError(404, 'Visitante não encontrado.')
    }

    await prisma.visitor.delete({
      where: { id: visitorId },
    })
  },
}
