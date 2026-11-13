import { decryptText, encryptText } from '../../lib/crypto.js'
import { HttpError } from '../../lib/http-error.js'
import { prisma } from '../../lib/prisma.js'
import type {
  CreateServiceProviderInput,
  ListServiceProvidersInput,
  ServiceProviderResponse,
  UpdateServiceProviderInput,
} from './service-providers.types.js'

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

function validateCreateInput(input: CreateServiceProviderInput): {
  companyName: string
  responsibleName: string
  document: string
  phone: string | null
  email: string | null
  serviceType: string
  unit: string | null
  authorizedBy: string
  observations: string | null
  vehiclePlate: string | null
  vehicleBrandModel: string | null
  vehicleColor: string | null
} {
  const companyName = input.companyName.trim()
  const responsibleName = input.responsibleName.trim()
  const document = normalizeOptionalText(input.document)
  const phone = normalizeOptionalText(input.phone)
  const email = normalizeOptionalText(input.email)
  const serviceType = input.serviceType.trim()
  const unit = normalizeOptionalText(input.unit)
  const authorizedBy = input.authorizedBy.trim()
  const observations = normalizeOptionalText(input.observations)
  const vehiclePlate = normalizeOptionalText(input.vehiclePlate)
  const vehicleBrandModel = normalizeOptionalText(input.vehicleBrandModel)
  const vehicleColor = normalizeOptionalText(input.vehicleColor)

  if (companyName.length < 2) {
    throw new HttpError(400, 'Nome da empresa deve ter ao menos 2 caracteres.')
  }

  if (responsibleName.length < 3) {
    throw new HttpError(400, 'Responsável deve ter ao menos 3 caracteres.')
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

  if (!serviceType) {
    throw new HttpError(400, 'Tipo de serviço é obrigatório.')
  }

  if (authorizedBy.length < 3) {
    throw new HttpError(400, 'Autorizado por deve ter ao menos 3 caracteres.')
  }

  return {
    companyName,
    responsibleName,
    document,
    phone,
    email,
    serviceType,
    unit,
    authorizedBy,
    observations,
    vehiclePlate,
    vehicleBrandModel,
    vehicleColor,
  }
}

function validateUpdateInput(input: UpdateServiceProviderInput): {
  companyName?: string
  responsibleName?: string
  document?: string
  phone?: string | null
  email?: string | null
  serviceType?: string
  unit?: string | null
  authorizedBy?: string
  observations?: string | null
} {
  const data: {
    companyName?: string
    responsibleName?: string
    document?: string
    phone?: string | null
    email?: string | null
    serviceType?: string
    unit?: string | null
    authorizedBy?: string
    observations?: string | null
  } = {}

  if (input.companyName !== undefined) {
    const companyName = input.companyName.trim()

    if (companyName.length < 2) {
      throw new HttpError(400, 'Nome da empresa deve ter ao menos 2 caracteres.')
    }

    data.companyName = companyName
  }

  if (input.responsibleName !== undefined) {
    const responsibleName = input.responsibleName.trim()

    if (responsibleName.length < 3) {
      throw new HttpError(400, 'Responsável deve ter ao menos 3 caracteres.')
    }

    data.responsibleName = responsibleName
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

  if (input.serviceType !== undefined) {
    const serviceType = input.serviceType.trim()

    if (!serviceType) {
      throw new HttpError(400, 'Tipo de serviço é obrigatório.')
    }

    data.serviceType = serviceType
  }

  if (input.unit !== undefined) {
    data.unit = normalizeOptionalText(input.unit)
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

function parsePagination(input: ListServiceProvidersInput): {
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

function toResponse(serviceProvider: {
  id: string
  companyName: string
  responsibleName: string
  documentEncrypted: string
  phoneEncrypted: string | null
  emailEncrypted: string | null
  serviceType: string
  unit: string | null
  authorizedBy: string
  observationsEncrypted: string | null
  vehiclePlateEncrypted: string | null
  vehicleBrandModel: string | null
  vehicleColor: string | null
  createdByUserId: string | null
  createdAt: Date
  updatedAt: Date
}): ServiceProviderResponse {
  return {
    id: serviceProvider.id,
    companyName: serviceProvider.companyName,
    responsibleName: serviceProvider.responsibleName,
    document: decryptText(serviceProvider.documentEncrypted),
    phone: serviceProvider.phoneEncrypted ? decryptText(serviceProvider.phoneEncrypted) : null,
    email: serviceProvider.emailEncrypted ? decryptText(serviceProvider.emailEncrypted) : null,
    serviceType: serviceProvider.serviceType,
    unit: serviceProvider.unit,
    authorizedBy: serviceProvider.authorizedBy,
    observations: serviceProvider.observationsEncrypted
      ? decryptText(serviceProvider.observationsEncrypted)
      : null,
    vehiclePlate: serviceProvider.vehiclePlateEncrypted
      ? decryptText(serviceProvider.vehiclePlateEncrypted)
      : null,
    vehicleBrandModel: serviceProvider.vehicleBrandModel,
    vehicleColor: serviceProvider.vehicleColor,
    createdByUserId: serviceProvider.createdByUserId,
    createdAt: serviceProvider.createdAt,
    updatedAt: serviceProvider.updatedAt,
  }
}

export const serviceProvidersService = {
  async create(input: CreateServiceProviderInput): Promise<ServiceProviderResponse> {
    const validated = validateCreateInput(input)

    const serviceProvider = await prisma.serviceProvider.create({
      data: {
        condominiumId: input.condominiumId,
        companyName: validated.companyName,
        responsibleName: validated.responsibleName,
        documentEncrypted: encryptText(validated.document),
        phoneEncrypted: validated.phone ? encryptText(validated.phone) : null,
        emailEncrypted: validated.email ? encryptText(validated.email) : null,
        serviceType: validated.serviceType,
        unit: validated.unit,
        authorizedBy: validated.authorizedBy,
        observationsEncrypted: validated.observations ? encryptText(validated.observations) : null,
        vehiclePlateEncrypted: validated.vehiclePlate ? encryptText(validated.vehiclePlate) : null,
        vehicleBrandModel: validated.vehicleBrandModel,
        vehicleColor: validated.vehicleColor,
        createdByUserId: input.createdByUserId,
      },
    })

    return toResponse(serviceProvider)
  },

  async list(input: ListServiceProvidersInput) {
    const { page, pageSize, skip, search } = parsePagination(input)

    const where = {
      condominiumId: input.condominiumId,
      ...(search
        ? {
            OR: [
              { companyName: { contains: search, mode: 'insensitive' as const } },
              { responsibleName: { contains: search, mode: 'insensitive' as const } },
              { serviceType: { contains: search, mode: 'insensitive' as const } },
              { unit: { contains: search, mode: 'insensitive' as const } },
              { authorizedBy: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    }

    const [items, total] = await prisma.$transaction([
      prisma.serviceProvider.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.serviceProvider.count({ where }),
    ])

    return {
      items: items.map((serviceProvider) => toResponse(serviceProvider)),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    }
  },

  async getById(id: string, condominiumId: string): Promise<ServiceProviderResponse> {
    const serviceProviderId = id.trim()

    if (!serviceProviderId) {
      throw new HttpError(400, 'ID do prestador de serviço é obrigatório.')
    }

    const serviceProvider = await prisma.serviceProvider.findFirst({
      where: {
        id: serviceProviderId,
        condominiumId,
      },
    })

    if (!serviceProvider) {
      throw new HttpError(404, 'Prestador de serviço não encontrado.')
    }

    return toResponse(serviceProvider)
  },

  async update(
    id: string,
    input: UpdateServiceProviderInput,
    condominiumId: string,
  ): Promise<ServiceProviderResponse> {
    const serviceProviderId = id.trim()

    if (!serviceProviderId) {
      throw new HttpError(400, 'ID do prestador de serviço é obrigatório.')
    }

    const validated = validateUpdateInput(input)

    const exists = await prisma.serviceProvider.findFirst({
      where: {
        id: serviceProviderId,
        condominiumId,
      },
      select: { id: true },
    })

    if (!exists) {
      throw new HttpError(404, 'Prestador de serviço não encontrado.')
    }

    const serviceProvider = await prisma.serviceProvider.update({
      where: { id: serviceProviderId },
      data: {
        companyName: validated.companyName,
        responsibleName: validated.responsibleName,
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
        serviceType: validated.serviceType,
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

    return toResponse(serviceProvider)
  },

  async remove(id: string, condominiumId: string): Promise<void> {
    const serviceProviderId = id.trim()

    if (!serviceProviderId) {
      throw new HttpError(400, 'ID do prestador de serviço é obrigatório.')
    }

    const exists = await prisma.serviceProvider.findFirst({
      where: {
        id: serviceProviderId,
        condominiumId,
      },
      select: { id: true },
    })

    if (!exists) {
      throw new HttpError(404, 'Prestador de serviço não encontrado.')
    }

    await prisma.serviceProvider.delete({
      where: { id: serviceProviderId },
    })
  },
}
