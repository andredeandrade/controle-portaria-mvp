import { prisma } from '../../lib/prisma.js'
import { HttpError } from '../../lib/http-error.js'
import { decryptText, encryptText } from '../../lib/crypto.js'
import type {
  CreateResidentInput,
  ListResidentsInput,
  ResidentResponse,
  ResidentRelation,
  VehicleInput,
  VehicleType,
  UpdateResidentInput,
} from './residents.types.js'

const PAGE_MIN = 1
const PAGE_SIZE_MIN = 1
const PAGE_SIZE_MAX = 100
const UNITS_MAX = 20

const RESIDENT_INCLUDE = {
  vehicles: {
    orderBy: { createdAt: 'asc' as const },
  },
  units: {
    orderBy: { position: 'asc' as const },
  },
}

type DbResidentRelation = 'PROPRIETARIO' | 'INQUILINO' | 'DEPENDENTE'
type DbVehicleType = 'CARRO' | 'MOTO' | 'OUTRO'

const RESIDENT_RELATION_TO_DB: Record<ResidentRelation, DbResidentRelation> = {
  proprietario: 'PROPRIETARIO',
  inquilino: 'INQUILINO',
  dependente: 'DEPENDENTE',
}

const RESIDENT_RELATION_FROM_DB: Record<DbResidentRelation, ResidentRelation> = {
  PROPRIETARIO: 'proprietario',
  INQUILINO: 'inquilino',
  DEPENDENTE: 'dependente',
}

const VEHICLE_TYPE_TO_DB: Record<VehicleType, DbVehicleType> = {
  carro: 'CARRO',
  moto: 'MOTO',
  outro: 'OUTRO',
}

const VEHICLE_TYPE_FROM_DB: Record<DbVehicleType, VehicleType> = {
  CARRO: 'carro',
  MOTO: 'moto',
  OUTRO: 'outro',
}

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

/**
 * Normaliza a lista de unidades: remove espaços e itens vazios e descarta
 * duplicadas (sem diferenciar maiúsculas/minúsculas), mantendo a ordem.
 */
function normalizeUnits(units: string[]): string[] {
  const seen = new Set<string>()
  const normalized: string[] = []

  for (const rawUnit of units) {
    const unit = String(rawUnit ?? '').trim()
    const key = unit.toLowerCase()

    if (!unit || seen.has(key)) {
      continue
    }

    seen.add(key)
    normalized.push(unit)
  }

  if (normalized.length === 0) {
    throw new HttpError(400, 'Informe ao menos uma unidade.')
  }

  if (normalized.length > UNITS_MAX) {
    throw new HttpError(400, `Informe no máximo ${UNITS_MAX} unidades.`)
  }

  return normalized
}

function parseRelation(value: string): ResidentRelation {
  if (value === 'proprietario' || value === 'inquilino' || value === 'dependente') {
    return value
  }

  throw new HttpError(400, 'Vínculo inválido.')
}

function normalizeVehicleInput(
  vehicle: VehicleInput,
  index: number,
): {
  type: DbVehicleType
  color: string | null
  plate: string | null
  brandModel: string | null
} | null {
  const typeRaw = String(vehicle.type ?? '')
    .trim()
    .toLowerCase()
  const color = normalizeOptionalText(vehicle.color)
  const plate = normalizeOptionalText(vehicle.plate)
  const brandModel = normalizeOptionalText(vehicle.brandModel)

  const hasAnyValue = Boolean(typeRaw || color || plate || brandModel)

  if (!hasAnyValue) {
    return null
  }

  if (typeRaw !== 'carro' && typeRaw !== 'moto' && typeRaw !== 'outro') {
    throw new HttpError(400, `Tipo de veículo inválido na posição ${index + 1}.`)
  }

  return {
    type: VEHICLE_TYPE_TO_DB[typeRaw],
    color,
    plate,
    brandModel,
  }
}

function normalizeVehiclesInput(vehicles: VehicleInput[] | undefined): {
  type: DbVehicleType
  color: string | null
  plate: string | null
  brandModel: string | null
}[] {
  if (!vehicles) {
    return []
  }

  return vehicles
    .map((vehicle, index) => normalizeVehicleInput(vehicle, index))
    .filter((vehicle) => vehicle !== null)
}

function validateCreateInput(input: CreateResidentInput): {
  fullName: string
  units: string[]
  relation: DbResidentRelation
  email: string | null
  phone: string | null
  document: string
  observations: string | null
  vehicles: {
    type: DbVehicleType
    color: string | null
    plate: string | null
    brandModel: string | null
  }[]
} {
  const fullName = input.fullName.trim()
  const units = normalizeUnits(input.units)
  const relation = parseRelation(input.relation)
  const email = normalizeOptionalText(input.email)
  const phone = normalizeOptionalText(input.phone)
  const document = normalizeOptionalText(input.document)
  const observations = normalizeOptionalText(input.observations)
  const vehicles = normalizeVehiclesInput(input.vehicles)

  if (fullName.length < 3) {
    throw new HttpError(400, 'Nome deve ter ao menos 3 caracteres.')
  }

  if (email && !validateEmail(email)) {
    throw new HttpError(400, 'E-mail inválido.')
  }

  if (!document) {
    throw new HttpError(400, 'Documento é obrigatório.')
  }

  if (document.length < 5) {
    throw new HttpError(400, 'Documento inválido.')
  }

  return {
    fullName,
    units,
    relation: RESIDENT_RELATION_TO_DB[relation],
    email,
    phone,
    document,
    observations,
    vehicles,
  }
}

function validateUpdateInput(input: UpdateResidentInput): {
  fullName?: string
  units?: string[]
  relation?: DbResidentRelation
  email?: string | null
  phone?: string | null
  document?: string | null
  observations?: string | null
  vehicles?: {
    type: DbVehicleType
    color: string | null
    plate: string | null
    brandModel: string | null
  }[]
} {
  const data: {
    fullName?: string
    units?: string[]
    relation?: DbResidentRelation
    email?: string | null
    phone?: string | null
    document?: string | null
    observations?: string | null
    vehicles?: {
      type: DbVehicleType
      color: string | null
      plate: string | null
      brandModel: string | null
    }[]
  } = {}

  if (input.fullName !== undefined) {
    const fullName = input.fullName.trim()

    if (fullName.length < 3) {
      throw new HttpError(400, 'Nome deve ter ao menos 3 caracteres.')
    }

    data.fullName = fullName
  }

  if (input.units !== undefined) {
    data.units = normalizeUnits(input.units)
  }

  if (input.relation !== undefined) {
    data.relation = RESIDENT_RELATION_TO_DB[parseRelation(input.relation)]
  }

  if (input.email !== undefined) {
    const email = normalizeOptionalText(input.email)

    if (email && !validateEmail(email)) {
      throw new HttpError(400, 'E-mail inválido.')
    }

    data.email = email
  }

  if (input.phone !== undefined) {
    data.phone = normalizeOptionalText(input.phone)
  }

  if (input.document !== undefined) {
    const document = normalizeOptionalText(input.document)

    if (document && document.length < 5) {
      throw new HttpError(400, 'Documento inválido.')
    }

    data.document = document
  }

  if (input.observations !== undefined) {
    data.observations = normalizeOptionalText(input.observations)
  }

  if (input.vehicles !== undefined) {
    data.vehicles = normalizeVehiclesInput(input.vehicles)
  }

  if (Object.keys(data).length === 0) {
    throw new HttpError(400, 'Nenhum campo válido para atualização foi enviado.')
  }

  return data
}

function parsePagination(input: ListResidentsInput): {
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

function toResponse(resident: {
  id: string
  fullName: string
  relation: DbResidentRelation
  emailEncrypted: string | null
  phoneEncrypted: string | null
  documentEncrypted: string | null
  observationsEncrypted: string | null
  vehicles: {
    id: string
    type: DbVehicleType
    color: string | null
    plateEncrypted: string | null
    brandModel: string | null
  }[]
  units: { unit: string }[]
  createdByUserId: string | null
  createdAt: Date
  updatedAt: Date
}): ResidentResponse {
  return {
    id: resident.id,
    fullName: resident.fullName,
    units: resident.units.map((residentUnit) => residentUnit.unit),
    relation: RESIDENT_RELATION_FROM_DB[resident.relation],
    email: resident.emailEncrypted ? decryptText(resident.emailEncrypted) : null,
    phone: resident.phoneEncrypted ? decryptText(resident.phoneEncrypted) : null,
    document: resident.documentEncrypted ? decryptText(resident.documentEncrypted) : null,
    observations: resident.observationsEncrypted
      ? decryptText(resident.observationsEncrypted)
      : null,
    vehicles: resident.vehicles.map((vehicle) => ({
      id: vehicle.id,
      type: VEHICLE_TYPE_FROM_DB[vehicle.type],
      color: vehicle.color,
      plate: vehicle.plateEncrypted ? decryptText(vehicle.plateEncrypted) : null,
      brandModel: vehicle.brandModel,
    })),
    createdByUserId: resident.createdByUserId,
    createdAt: resident.createdAt,
    updatedAt: resident.updatedAt,
  }
}

export const residentsService = {
  async create(input: CreateResidentInput): Promise<ResidentResponse> {
    const validated = validateCreateInput(input)

    const resident = await prisma.resident.create({
      data: {
        condominiumId: input.condominiumId,
        fullName: validated.fullName,
        relation: validated.relation,
        units: {
          create: validated.units.map((unit, position) => ({ unit, position })),
        },
        emailEncrypted: validated.email ? encryptText(validated.email) : null,
        phoneEncrypted: validated.phone ? encryptText(validated.phone) : null,
        documentEncrypted: encryptText(validated.document),
        observationsEncrypted: validated.observations ? encryptText(validated.observations) : null,
        vehicles:
          validated.vehicles.length > 0
            ? {
                create: validated.vehicles.map((vehicle) => ({
                  type: vehicle.type,
                  color: vehicle.color,
                  plateEncrypted: vehicle.plate ? encryptText(vehicle.plate) : null,
                  brandModel: vehicle.brandModel,
                })),
              }
            : undefined,
        createdByUserId: input.createdByUserId,
      },
      include: RESIDENT_INCLUDE,
    })

    return toResponse(resident)
  },

  async list(input: ListResidentsInput) {
    const { page, pageSize, skip, search } = parsePagination(input)

    const where = {
      condominiumId: input.condominiumId,
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' as const } },
              {
                units: {
                  some: { unit: { contains: search, mode: 'insensitive' as const } },
                },
              },
            ],
          }
        : {}),
    }

    const [items, total] = await prisma.$transaction([
      prisma.resident.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: RESIDENT_INCLUDE,
      }),
      prisma.resident.count({ where }),
    ])

    return {
      items: items.map((resident) => toResponse(resident)),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    }
  },

  async getById(id: string, condominiumId: string): Promise<ResidentResponse> {
    const residentId = id.trim()

    if (!residentId) {
      throw new HttpError(400, 'ID do morador é obrigatório.')
    }

    const resident = await prisma.resident.findFirst({
      where: {
        id: residentId,
        condominiumId,
      },
      include: RESIDENT_INCLUDE,
    })

    if (!resident) {
      throw new HttpError(404, 'Morador não encontrado.')
    }

    return toResponse(resident)
  },

  async update(
    id: string,
    input: UpdateResidentInput,
    condominiumId: string,
  ): Promise<ResidentResponse> {
    const residentId = id.trim()

    if (!residentId) {
      throw new HttpError(400, 'ID do morador é obrigatório.')
    }

    const validated = validateUpdateInput(input)

    const exists = await prisma.resident.findFirst({
      where: {
        id: residentId,
        condominiumId,
      },
      select: { id: true },
    })

    if (!exists) {
      throw new HttpError(404, 'Morador não encontrado.')
    }

    const resident = await prisma.resident.update({
      where: { id: residentId },
      data: {
        fullName: validated.fullName,
        relation: validated.relation,
        units:
          validated.units === undefined
            ? undefined
            : {
                deleteMany: {},
                create: validated.units.map((unit, position) => ({ unit, position })),
              },
        emailEncrypted:
          validated.email === undefined
            ? undefined
            : validated.email
              ? encryptText(validated.email)
              : null,
        phoneEncrypted:
          validated.phone === undefined
            ? undefined
            : validated.phone
              ? encryptText(validated.phone)
              : null,
        documentEncrypted:
          validated.document === undefined
            ? undefined
            : validated.document
              ? encryptText(validated.document)
              : null,
        observationsEncrypted:
          validated.observations === undefined
            ? undefined
            : validated.observations
              ? encryptText(validated.observations)
              : null,
        vehicles:
          validated.vehicles === undefined
            ? undefined
            : {
                deleteMany: {},
                create: validated.vehicles.map((vehicle) => ({
                  type: vehicle.type,
                  color: vehicle.color,
                  plateEncrypted: vehicle.plate ? encryptText(vehicle.plate) : null,
                  brandModel: vehicle.brandModel,
                })),
              },
      },
      include: RESIDENT_INCLUDE,
    })

    return toResponse(resident)
  },

  async remove(id: string, condominiumId: string): Promise<void> {
    const residentId = id.trim()

    if (!residentId) {
      throw new HttpError(400, 'ID do morador é obrigatório.')
    }

    const exists = await prisma.resident.findFirst({
      where: {
        id: residentId,
        condominiumId,
      },
      select: { id: true },
    })

    if (!exists) {
      throw new HttpError(404, 'Morador não encontrado.')
    }

    await prisma.resident.delete({
      where: { id: residentId },
    })
  },
}
