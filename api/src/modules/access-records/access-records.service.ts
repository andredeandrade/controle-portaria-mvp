import { decryptText, encryptText } from '../../lib/crypto.js'
import { HttpError } from '../../lib/http-error.js'
import { prisma } from '../../lib/prisma.js'
import type {
  AccessRecordListStatus,
  AccessRecordPersonInput,
  AccessRecordResponse,
  CheckInAccessRecordInput,
  CheckOutAccessRecordInput,
  ListAccessRecordsInput,
} from './access-records.types.js'

const PAGE_MIN = 1
const PAGE_SIZE_MIN = 1
const PAGE_SIZE_MAX = 100

const PERSON_CATEGORIES = new Set<string>([
  'morador',
  'visitante',
  'prestador_servico',
  'autorizado',
])
const LOCOMOTION_OPTIONS = new Set<string>([
  'a_pe',
  'carro',
  'moto',
  'bicicleta',
  'caminhao',
  'outro',
])
const COLOR_OPTIONS = new Set<string>([
  'branco',
  'preto',
  'prata',
  'cinza',
  'azul',
  'vermelho',
  'verde',
  'amarelo',
  'outra_cor',
])

function normalizeOptionalText(value: string | null | undefined): string | null {
  if (value === undefined || value === null) {
    return null
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function validatePeople(people: AccessRecordPersonInput[] | undefined): AccessRecordPersonInput[] {
  if (!Array.isArray(people) || people.length === 0) {
    throw new HttpError(400, 'Informe ao menos uma pessoa no registro.')
  }

  return people.map((person, index) => {
    const category = String(person.category ?? '').trim()
    const name = String(person.name ?? '').trim()
    const document = normalizeOptionalText(person.document)
    const unit = normalizeOptionalText(person.unit)

    if (!PERSON_CATEGORIES.has(category)) {
      throw new HttpError(400, `Categoria da pessoa ${index + 1} inválida.`)
    }

    if (name.length < 3) {
      throw new HttpError(400, `Nome da pessoa ${index + 1} deve ter ao menos 3 caracteres.`)
    }

    if (document && document.length < 5) {
      throw new HttpError(400, `Documento da pessoa ${index + 1} inválido.`)
    }

    return {
      category,
      name,
      document: document ?? undefined,
      unit: unit ?? undefined,
    }
  })
}

function normalizeIdentityText(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function normalizeDocument(value: string | null | undefined): string {
  return (value ?? '').replace(/[^0-9a-z]/gi, '').toUpperCase()
}

type PersonIdentity = {
  name: string
  unit?: string | null
  document?: string | null
}

/**
 * Considera a mesma pessoa quando os documentos coincidem; sem documento em
 * um dos lados, compara nome + unidade.
 */
function isSamePerson(a: PersonIdentity, b: PersonIdentity): boolean {
  const documentA = normalizeDocument(a.document)
  const documentB = normalizeDocument(b.document)

  if (documentA && documentB) {
    return documentA === documentB
  }

  return (
    normalizeIdentityText(a.name) === normalizeIdentityText(b.name) &&
    normalizeIdentityText(a.unit) === normalizeIdentityText(b.unit)
  )
}

function ensureNoDuplicatedPeople(people: AccessRecordPersonInput[]) {
  people.forEach((person, index) => {
    const duplicatedIndex = people.findIndex((other) => isSamePerson(person, other))

    if (duplicatedIndex !== index) {
      throw new HttpError(400, `Pessoa ${index + 1} (${person.name}) está repetida no registro.`)
    }
  })
}

/**
 * Impede um novo check-in para quem ainda está dentro do condomínio (pessoa
 * sem saída registrada). O documento é criptografado com IV aleatório, então a
 * comparação é feita em memória sobre as pessoas com acesso ativo do tenant.
 */
async function ensureNoActiveAccess(condominiumId: string, people: AccessRecordPersonInput[]) {
  const activePeople = await prisma.accessRecordPerson.findMany({
    where: {
      checkOutAt: null,
      accessRecord: { condominiumId, checkOutAt: null },
    },
    select: { name: true, unit: true, documentEncrypted: true },
  })

  const activeIdentities = activePeople.map((person) => ({
    name: person.name,
    unit: person.unit,
    document: person.documentEncrypted ? decryptText(person.documentEncrypted) : null,
  }))

  const personWithActiveAccess = people.find((person) =>
    activeIdentities.some((active) => isSamePerson(person, active)),
  )

  if (personWithActiveAccess) {
    throw new HttpError(
      409,
      `${personWithActiveAccess.name} já possui um acesso ativo. Registre a saída antes de um novo acesso.`,
    )
  }
}

function validateLocomotion(locomotion: string | null | undefined): string | null {
  const normalized = normalizeOptionalText(locomotion)

  if (!normalized) {
    return null
  }

  if (!LOCOMOTION_OPTIONS.has(normalized)) {
    throw new HttpError(400, 'Locomoção inválida.')
  }

  return normalized
}

function validateColor(color: string | null | undefined): string | null {
  const normalized = normalizeOptionalText(color)

  if (!normalized) {
    return null
  }

  if (!COLOR_OPTIONS.has(normalized)) {
    throw new HttpError(400, 'Cor inválida.')
  }

  return normalized
}

function validateStatus(status: AccessRecordListStatus | undefined): AccessRecordListStatus {
  if (status === undefined) {
    return 'all'
  }

  if (status !== 'all' && status !== 'open' && status !== 'closed') {
    throw new HttpError(400, 'Status inválido. Use all, open ou closed.')
  }

  return status
}

function normalizePersonIds(personIds: string[] | undefined): string[] | undefined {
  if (!personIds) {
    return undefined
  }

  const normalized = [...new Set(personIds.map((personId) => personId.trim()).filter(Boolean))]

  return normalized.length > 0 ? normalized : undefined
}

function parsePagination(input: ListAccessRecordsInput): {
  page: number
  pageSize: number
  skip: number
  search: string | undefined
  status: AccessRecordListStatus
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

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    search: input.search?.trim() || undefined,
    status: validateStatus(input.status),
  }
}

function toResponse(accessRecord: {
  id: string
  company: string | null
  locomotion: string | null
  color: string | null
  plateEncrypted: string | null
  brandModel: string | null
  observationsEncrypted: string | null
  checkOutObservationsEncrypted: string | null
  checkInAt: Date
  checkOutAt: Date | null
  checkedInByUserId: string | null
  checkedOutByUserId: string | null
  createdAt: Date
  updatedAt: Date
  people: Array<{
    id: string
    category: string
    name: string
    unit: string | null
    documentEncrypted: string | null
    checkOutAt: Date | null
    checkedOutByUserId: string | null
    checkOutObservationsEncrypted: string | null
  }>
}): AccessRecordResponse {
  return {
    id: accessRecord.id,
    people: accessRecord.people.map((person) => ({
      id: person.id,
      category: person.category,
      name: person.name,
      unit: person.unit,
      document: person.documentEncrypted ? decryptText(person.documentEncrypted) : null,
      checkOutAt: person.checkOutAt,
      checkedOutByUserId: person.checkedOutByUserId,
      checkOutObservations: person.checkOutObservationsEncrypted
        ? decryptText(person.checkOutObservationsEncrypted)
        : null,
      isOpen: person.checkOutAt === null,
    })),
    company: accessRecord.company,
    locomotion: accessRecord.locomotion,
    color: accessRecord.color,
    plate: accessRecord.plateEncrypted ? decryptText(accessRecord.plateEncrypted) : null,
    brandModel: accessRecord.brandModel,
    observations: accessRecord.observationsEncrypted
      ? decryptText(accessRecord.observationsEncrypted)
      : null,
    checkOutObservations: accessRecord.checkOutObservationsEncrypted
      ? decryptText(accessRecord.checkOutObservationsEncrypted)
      : null,
    checkInAt: accessRecord.checkInAt,
    checkOutAt: accessRecord.checkOutAt,
    checkedInByUserId: accessRecord.checkedInByUserId,
    checkedOutByUserId: accessRecord.checkedOutByUserId,
    createdAt: accessRecord.createdAt,
    updatedAt: accessRecord.updatedAt,
    isOpen: accessRecord.checkOutAt === null,
  }
}

function matchesSearch(
  accessRecord: {
    company: string | null
    locomotion: string | null
    color: string | null
    plateEncrypted: string | null
    brandModel: string | null
    people: Array<{
      category: string
      name: string
      unit: string | null
      documentEncrypted: string | null
    }>
  },
  search: string,
): boolean {
  const normalizedSearch = search.trim().toLowerCase()

  if (!normalizedSearch) {
    return true
  }

  const searchableValues = [
    accessRecord.company,
    accessRecord.locomotion,
    accessRecord.color,
    accessRecord.plateEncrypted ? decryptText(accessRecord.plateEncrypted) : null,
    accessRecord.brandModel,
    ...accessRecord.people.flatMap((person) => [
      person.name,
      person.category,
      person.unit,
      person.documentEncrypted ? decryptText(person.documentEncrypted) : null,
    ]),
  ]

  return searchableValues
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .some((value) => value.toLowerCase().includes(normalizedSearch))
}

export const accessRecordsService = {
  async checkIn(input: CheckInAccessRecordInput): Promise<AccessRecordResponse> {
    const people = validatePeople(input.people)
    const company = normalizeOptionalText(input.company)
    const locomotion = validateLocomotion(input.locomotion)
    const color = validateColor(input.color)
    const plate = normalizeOptionalText(input.plate)
    const brandModel = normalizeOptionalText(input.brandModel)
    const observations = normalizeOptionalText(input.observations)

    ensureNoDuplicatedPeople(people)
    await ensureNoActiveAccess(input.condominiumId, people)

    const accessRecord = await prisma.accessRecord.create({
      data: {
        condominiumId: input.condominiumId,
        company,
        locomotion,
        color,
        plateEncrypted: plate ? encryptText(plate) : null,
        brandModel,
        observationsEncrypted: observations ? encryptText(observations) : null,
        checkedInByUserId: input.checkedInByUserId,
        people: {
          create: people.map((person) => ({
            category: person.category,
            name: person.name,
            unit: person.unit ?? null,
            documentEncrypted: person.document ? encryptText(person.document) : null,
          })),
        },
      },
      include: {
        people: true,
      },
    })

    return toResponse(accessRecord)
  },

  async checkOut(
    id: string,
    input: CheckOutAccessRecordInput,
    condominiumId: string,
  ): Promise<AccessRecordResponse> {
    const accessRecordId = id.trim()

    if (!accessRecordId) {
      throw new HttpError(400, 'ID do registro de acesso é obrigatório.')
    }

    const existing = await prisma.accessRecord.findFirst({
      where: {
        id: accessRecordId,
        condominiumId,
      },
      include: {
        people: true,
      },
    })

    if (!existing) {
      throw new HttpError(404, 'Registro de acesso não encontrado.')
    }

    if (existing.checkOutAt) {
      throw new HttpError(400, 'Este registro já possui saída registrada.')
    }

    const targetPersonIds = normalizePersonIds(input.personIds)
    const availablePeople = existing.people.filter((person) => person.checkOutAt === null)

    if (availablePeople.length === 0) {
      throw new HttpError(400, 'Todas as pessoas deste registro já possuem saída.')
    }

    const peopleToCheckOut = targetPersonIds
      ? availablePeople.filter((person) => targetPersonIds.includes(person.id))
      : availablePeople

    if (targetPersonIds && peopleToCheckOut.length !== targetPersonIds.length) {
      throw new HttpError(
        400,
        'Um ou mais personIds não pertencem ao registro ou já possuem saída.',
      )
    }

    if (peopleToCheckOut.length === 0) {
      throw new HttpError(400, 'Nenhuma pessoa válida informada para registrar saída.')
    }

    const checkOutObservations = normalizeOptionalText(input.observations)
    const checkOutAt = new Date()

    const transactionResult = await prisma.$transaction([
      prisma.accessRecordPerson.updateMany({
        where: {
          id: {
            in: peopleToCheckOut.map((person) => person.id),
          },
          accessRecordId: accessRecordId,
          checkOutAt: null,
        },
        data: {
          checkOutAt,
          checkedOutByUserId: input.checkedOutByUserId,
          checkOutObservationsEncrypted: checkOutObservations
            ? encryptText(checkOutObservations)
            : null,
        },
      }),
      prisma.accessRecordPerson.count({
        where: {
          accessRecordId: accessRecordId,
          checkOutAt: null,
        },
      }),
    ])

    const remainingOpenPeopleCount = transactionResult[1]

    if (remainingOpenPeopleCount === 0) {
      await prisma.accessRecord.update({
        where: {
          id: accessRecordId,
        },
        data: {
          checkOutAt,
          checkedOutByUserId: input.checkedOutByUserId,
          checkOutObservationsEncrypted: checkOutObservations
            ? encryptText(checkOutObservations)
            : null,
        },
      })
    }

    const accessRecord = await prisma.accessRecord.findFirst({
      where: {
        id: accessRecordId,
        condominiumId,
      },
      include: {
        people: true,
      },
    })

    if (!accessRecord) {
      throw new HttpError(404, 'Registro de acesso não encontrado.')
    }

    return toResponse(accessRecord)
  },

  async list(input: ListAccessRecordsInput) {
    const { page, pageSize, skip, search, status } = parsePagination(input)

    const baseWhere = {
      condominiumId: input.condominiumId,
      ...(status === 'open' ? { checkOutAt: null } : {}),
      ...(status === 'closed' ? { checkOutAt: { not: null } } : {}),
    }

    if (search) {
      const items = await prisma.accessRecord.findMany({
        where: baseWhere,
        include: {
          people: true,
        },
        orderBy: [{ checkInAt: 'desc' }, { createdAt: 'desc' }],
      })

      const filteredItems = items.filter((item) => matchesSearch(item, search))

      return {
        items: filteredItems.slice(skip, skip + pageSize).map((item) => toResponse(item)),
        pagination: {
          page,
          pageSize,
          total: filteredItems.length,
          totalPages: Math.max(1, Math.ceil(filteredItems.length / pageSize)),
        },
      }
    }

    const [items, total] = await prisma.$transaction([
      prisma.accessRecord.findMany({
        where: baseWhere,
        include: {
          people: true,
        },
        skip,
        take: pageSize,
        orderBy: [{ checkInAt: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.accessRecord.count({ where: baseWhere }),
    ])

    return {
      items: items.map((item) => toResponse(item)),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    }
  },

  async getById(id: string, condominiumId: string): Promise<AccessRecordResponse> {
    const accessRecordId = id.trim()

    if (!accessRecordId) {
      throw new HttpError(400, 'ID do registro de acesso é obrigatório.')
    }

    const accessRecord = await prisma.accessRecord.findFirst({
      where: {
        id: accessRecordId,
        condominiumId,
      },
      include: {
        people: true,
      },
    })

    if (!accessRecord) {
      throw new HttpError(404, 'Registro de acesso não encontrado.')
    }

    return toResponse(accessRecord)
  },
}
