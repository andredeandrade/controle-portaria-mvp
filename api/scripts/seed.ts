/**
 * Seed de dados fictícios para testes locais e para a demo pública.
 *
 * Cria (ou recria) o condomínio de teste "demo" com um volume realista de dados em todos os
 * módulos (algumas semanas de acessos, ocorrências, eventos etc.), com datas relativas a "agora"
 * para parecerem sempre recentes. Os dados de HOJE são garantidos de forma determinística
 * (nunca no futuro), para que dashboard e relatórios não fiquem vazios em nenhum período.
 * Só apaga dados do condomínio "demo" — outros condomínios ficam intactos.
 * Só roda em banco local, ou em banco remoto com SEED_ALLOW_REMOTE=demo
 * (veja src/lib/seed-guard.ts). Sempre bloqueado com NODE_ENV=production.
 *
 * As datas usam o fuso do processo (TZ). Inserções são feitas em lote (`createMany` com IDs
 * gerados no cliente) para manter o tempo baixo mesmo contra um banco remoto.
 *
 * Uso: pnpm --filter ./api seed
 * Login: http://demo.localhost:3000 com admin@demo.local / Senha@123
 */

import 'dotenv/config'
import { fakerPT_BR as faker } from '@faker-js/faker'
import { PrismaPg } from '@prisma/adapter-pg'
import { Prisma, PrismaClient } from '../src/generated/prisma-client/client.js'
import { encryptText } from '../src/lib/crypto.js'
import { DEMO_PASSWORD, DEMO_USERS } from '../src/lib/demo-users.js'
import { hashPassword } from '../src/lib/password.js'
import {
  BUSINESS_HOUR_WEIGHTS,
  GENERAL_HOUR_WEIGHTS,
  addDays,
  addMinutes,
  clampToNow,
  elapsedDayFraction,
  randomPastDate as randomPastDateAt,
  randomTimeOnDay,
  randomTimestampToday,
  startOfDay,
} from '../src/lib/seed-dates.js'
import { assertSeedAllowed } from '../src/lib/seed-guard.js'

// ---------------------------------------------------------------------------
// Configuração
// ---------------------------------------------------------------------------

const TENANT_SLUG = 'demo'
const TENANT_NAME = 'Condomínio Demo'

const COUNTS = {
  residents: 60,
  visitors: 80,
  serviceProviders: 30,
  authorizations: 30,
  events: 12,
  incidents: 60,
} as const

/** Quantidade de registros de acesso por dia: [mín, máx]. */
const ACCESS_PER_WEEKDAY = [22, 38] as const
const ACCESS_PER_WEEKEND_DAY = [10, 20] as const
/** Mínimo de acessos já encerrados hoje, mesmo que o seed rode logo após a meia-noite. */
const MIN_CLOSED_ACCESS_TODAY = 8
const OPEN_ACCESS_RECORDS = [6, 10] as const
/** Ocorrências garantidas hoje. */
const INCIDENTS_TODAY = 4

const DAYS_BACK = 30
const BATCH_SIZE = 1000

// Valores iguais aos selects do front (web/src/modules/form/components e web/src/types/ocorrencias.ts)
const COLORS = [
  'branco',
  'preto',
  'prata',
  'cinza',
  'azul',
  'vermelho',
  'verde',
  'amarelo',
] as const
const ACCESS_CATEGORIES = ['morador', 'visitante', 'prestador_servico', 'autorizado'] as const
const AUTHORIZATION_PERSON_TYPES = ['morador', 'visitante', 'prestador_servico'] as const

type AccessCategory = (typeof ACCESS_CATEGORIES)[number]

const CATEGORY_WEIGHTS: { weight: number; value: AccessCategory }[] = [
  { weight: 40, value: 'morador' },
  { weight: 30, value: 'visitante' },
  { weight: 20, value: 'prestador_servico' },
  { weight: 10, value: 'autorizado' },
]
/** Permanência em minutos por categoria: [mín, máx]. */
const STAY_MINUTES: Record<AccessCategory, readonly [number, number]> = {
  morador: [3, 40],
  visitante: [30, 240],
  prestador_servico: [120, 480],
  autorizado: [30, 180],
}
const LOCOMOTION_WEIGHTS = [
  { weight: 40, value: 'a_pe' },
  { weight: 38, value: 'carro' },
  { weight: 10, value: 'moto' },
  { weight: 6, value: 'bicicleta' },
  { weight: 3, value: 'caminhao' },
  { weight: 3, value: 'outro' },
] as const

const OCCURRENCE_TYPE_WEIGHTS = [
  { weight: 14, value: 'orientacao' },
  { weight: 12, value: 'outro' },
  { weight: 12, value: 'pertubacao_sossego' },
  { weight: 6, value: 'averiguacao_atitude_suspeita' },
  { weight: 6, value: 'acesso_nao_autorizado' },
  { weight: 5, value: 'veiculo_atitude_suspeita' },
  { weight: 5, value: 'discussao_conflito' },
  { weight: 5, value: 'falha_tecnica' },
  { weight: 4, value: 'falta_energia' },
  { weight: 4, value: 'falta_agua' },
  { weight: 5, value: 'descarte_irregular_lixo' },
  { weight: 4, value: 'resgate_ou_invasao_animal' },
  { weight: 3, value: 'furto' },
  { weight: 3, value: 'vandalismo' },
  { weight: 1, value: 'incendio' },
  { weight: 1, value: 'roubo' },
  { weight: 1, value: 'emergencia_medica' },
] as const

const CAR_MODELS = [
  'Fiat Argo',
  'VW Gol',
  'Chevrolet Onix',
  'Hyundai HB20',
  'Toyota Corolla',
  'Jeep Renegade',
  'Honda Civic',
  'Renault Kwid',
  'VW T-Cross',
  'Fiat Strada',
]
const MOTO_MODELS = ['Honda CG 160', 'Yamaha Fazer 250', 'Honda Biz', 'Yamaha XTZ Lander']
const SERVICE_TYPES = [
  'Eletricista',
  'Encanador',
  'Pintura',
  'Jardinagem',
  'Limpeza',
  'Manutenção de elevador',
  'Internet / TV',
  'Dedetização',
  'Mudança',
  'Entrega de móveis',
]
const EVENT_SPACES = [
  'Salão de festas',
  'Churrasqueira',
  'Espaço gourmet',
  'Área da piscina',
  'Quadra',
]
const EVENT_TITLES = [
  'Aniversário',
  'Churrasco de família',
  'Chá de bebê',
  'Confraternização',
  'Festa infantil',
  'Reunião de amigos',
]
/** Dias (relativos a hoje) dos eventos: passados, hoje (2) e futuros. */
const EVENT_DAY_OFFSETS = [-25, -18, -12, -8, -4, -2, 0, 0, 2, 5, 9, 16]
const INCIDENT_PLACES = [
  'Portaria',
  'Garagem',
  'Bloco A',
  'Bloco B',
  'Bloco C',
  'Piscina',
  'Playground',
  'Estacionamento',
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function toDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function toTimeString(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** Número aleatório em [0, 1) vindo do faker, para manter o seed determinístico. */
function random(): number {
  return faker.number.float({ min: 0, max: 0.999999 })
}

function randomInt([min, max]: readonly [number, number]): number {
  return faker.number.int({ min, max })
}

function uuid(): string {
  return faker.string.uuid()
}

function randomUnit(): string {
  const block = faker.helpers.arrayElement(['A', 'B', 'C'])
  const floor = faker.number.int({ min: 1, max: 12 })
  const apartment = faker.number.int({ min: 1, max: 4 })
  return `${block}-${floor}0${apartment}`
}

function randomPlate(): string {
  const letters = faker.string.alpha({ length: 3, casing: 'upper' })
  const letter = faker.string.alpha({ length: 1, casing: 'upper' })
  return `${letters}${faker.string.numeric(1)}${letter}${faker.string.numeric(2)}`
}

function randomCpf(): string {
  const digits = faker.string.numeric(11)
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

function randomPhone(): string {
  return `(${faker.number.int({ min: 11, max: 99 })}) 9${faker.string.numeric(4)}-${faker.string.numeric(4)}`
}

function maybe<T>(probability: number, factory: () => T): T | null {
  return faker.datatype.boolean({ probability }) ? factory() : null
}

function encryptOptional(value: string | null): string | null {
  return value === null ? null : encryptText(value)
}

function randomColor(): string {
  return faker.helpers.arrayElement(COLORS)
}

/** Insere `rows` em lotes (uma query por lote). */
async function insertInBatches<T>(
  rows: readonly T[],
  insert: (batch: T[]) => Promise<unknown>,
): Promise<void> {
  for (let offset = 0; offset < rows.length; offset += BATCH_SIZE) {
    await insert(rows.slice(offset, offset + BATCH_SIZE))
  }
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const startedAt = performance.now()
  const databaseUrl = process.env['DATABASE_URL']
  if (!databaseUrl) {
    throw new Error('DATABASE_URL não definida (confira api/.env).')
  }

  const target = assertSeedAllowed({
    databaseUrl,
    nodeEnv: process.env['NODE_ENV'],
    allowRemote: process.env['SEED_ALLOW_REMOTE'],
  })
  console.log(
    `Seed alvo: ${target.host}/${target.database} (${target.remote ? 'REMOTO, liberado por SEED_ALLOW_REMOTE=demo' : 'local'})`,
  )
  console.log(`Serão apagados e recriados os dados do condomínio "${TENANT_SLUG}".`)
  faker.seed(42)

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) })

  try {
    const now = new Date()
    const todayStart = startOfDay(now)
    const randomPastDate = (daysBack: number): Date => randomPastDateAt(now, daysBack, random)

    const condominium = await prisma.condominium.upsert({
      where: { slug: TENANT_SLUG },
      update: { name: TENANT_NAME },
      create: { slug: TENANT_SLUG, name: TENANT_NAME },
    })
    const condominiumId = condominium.id

    // Limpa os dados do condomínio demo (ordem respeita as FKs; filhos saem por cascade).
    console.log(`Limpando dados do condomínio "${TENANT_SLUG}"...`)
    await prisma.accessRecord.deleteMany({ where: { condominiumId } })
    await prisma.event.deleteMany({ where: { condominiumId } })
    await prisma.authorization.deleteMany({ where: { condominiumId } })
    await prisma.incident.deleteMany({ where: { condominiumId } })
    await prisma.serviceProvider.deleteMany({ where: { condominiumId } })
    await prisma.visitor.deleteMany({ where: { condominiumId } })
    await prisma.resident.deleteMany({ where: { condominiumId } })
    await prisma.user.deleteMany({ where: { condominiumId } })

    // --- Usuários -----------------------------------------------------------
    const passwordHash = await hashPassword(DEMO_PASSWORD)

    const users = await Promise.all(
      DEMO_USERS.map((spec) =>
        prisma.user.create({ data: { ...spec, condominiumId, passwordHash } }),
      ),
    )
    const userIds = users.map((user) => user.id)
    const randomUserId = (): string => faker.helpers.arrayElement(userIds)

    // --- Moradores (+ unidades e veículos) -----------------------------------
    // `unit` é a unidade principal (primeira), usada como destino nos demais módulos.
    // Os 2 primeiros moradores são cadastrados HOJE (relatório de moradores do dia).
    const residents: {
      fullName: string
      unit: string
      units: string[]
      document: string | null
    }[] = []
    const residentRows: Prisma.ResidentCreateManyInput[] = []
    const residentUnitRows: Prisma.ResidentUnitCreateManyInput[] = []
    const vehicleRows: Prisma.VehicleCreateManyInput[] = []

    for (let i = 0; i < COUNTS.residents; i++) {
      const id = uuid()
      const fullName = faker.person.fullName()
      // ~20% dos moradores têm duas unidades.
      const unitCount = faker.datatype.boolean({ probability: 0.2 }) ? 2 : 1
      const unitSet = new Set<string>()
      while (unitSet.size < unitCount) unitSet.add(randomUnit())
      const units = [...unitSet]
      const unit = units[0] ?? randomUnit()
      const document = maybe(0.8, randomCpf)
      const vehicleCount = faker.helpers.weightedArrayElement([
        { weight: 4, value: 0 },
        { weight: 4, value: 1 },
        { weight: 2, value: 2 },
      ])

      residentRows.push({
        id,
        condominiumId,
        fullName,
        relation: faker.helpers.arrayElement(['PROPRIETARIO', 'INQUILINO', 'DEPENDENTE'] as const),
        emailEncrypted: encryptOptional(
          maybe(0.7, () =>
            faker.internet.email({ firstName: fullName.split(' ')[0] }).toLowerCase(),
          ),
        ),
        phoneEncrypted: encryptOptional(maybe(0.8, randomPhone)),
        documentEncrypted: encryptOptional(document),
        observationsEncrypted: encryptOptional(maybe(0.2, () => faker.lorem.sentence())),
        createdByUserId: randomUserId(),
        createdAt: i < 2 ? randomTimestampToday(now, random) : randomPastDate(DAYS_BACK * 3),
      })
      units.forEach((value, position) =>
        residentUnitRows.push({ id: uuid(), residentId: id, unit: value, position }),
      )
      for (let v = 0; v < vehicleCount; v++) {
        const type = faker.helpers.weightedArrayElement([
          { weight: 8, value: 'CARRO' as const },
          { weight: 2, value: 'MOTO' as const },
        ])
        vehicleRows.push({
          id: uuid(),
          residentId: id,
          type,
          color: randomColor(),
          plateEncrypted: encryptText(randomPlate()),
          brandModel: faker.helpers.arrayElement(type === 'CARRO' ? CAR_MODELS : MOTO_MODELS),
        })
      }

      residents.push({ fullName, unit, units, document })
    }

    await insertInBatches(residentRows, (data) => prisma.resident.createMany({ data }))
    await insertInBatches(residentUnitRows, (data) => prisma.residentUnit.createMany({ data }))
    await insertInBatches(vehicleRows, (data) => prisma.vehicle.createMany({ data }))

    const randomResident = () => faker.helpers.arrayElement(residents)

    // --- Visitantes ---------------------------------------------------------
    // Os 3 primeiros são cadastrados HOJE.
    const visitors: { fullName: string; unit: string; document: string }[] = []
    const visitorRows: Prisma.VisitorCreateManyInput[] = []

    for (let i = 0; i < COUNTS.visitors; i++) {
      const host = randomResident()
      const fullName = faker.person.fullName()
      const document = randomCpf()
      const hasVehicle = faker.datatype.boolean({ probability: 0.4 })

      visitorRows.push({
        id: uuid(),
        condominiumId,
        fullName,
        unit: host.unit,
        authorizedBy: host.fullName,
        documentEncrypted: encryptText(document),
        emailEncrypted: encryptOptional(maybe(0.4, () => faker.internet.email().toLowerCase())),
        phoneEncrypted: encryptOptional(maybe(0.6, randomPhone)),
        observationsEncrypted: encryptOptional(maybe(0.2, () => faker.lorem.sentence())),
        vehiclePlateEncrypted: hasVehicle ? encryptText(randomPlate()) : null,
        vehicleBrandModel: hasVehicle ? faker.helpers.arrayElement(CAR_MODELS) : null,
        vehicleColor: hasVehicle ? randomColor() : null,
        createdByUserId: randomUserId(),
        createdAt: i < 3 ? randomTimestampToday(now, random) : randomPastDate(DAYS_BACK * 2),
      })

      visitors.push({ fullName, unit: host.unit, document })
    }
    await insertInBatches(visitorRows, (data) => prisma.visitor.createMany({ data }))

    // --- Prestadores de serviço --------------------------------------------
    // Os 3 primeiros são cadastrados HOJE.
    const providers: {
      responsibleName: string
      companyName: string
      unit: string | null
      document: string
    }[] = []
    const providerRows: Prisma.ServiceProviderCreateManyInput[] = []

    for (let i = 0; i < COUNTS.serviceProviders; i++) {
      const host = maybe(0.7, randomResident)
      const responsibleName = faker.person.fullName()
      const companyName = faker.company.name()
      const document = randomCpf()
      const hasVehicle = faker.datatype.boolean({ probability: 0.6 })

      providerRows.push({
        id: uuid(),
        condominiumId,
        companyName,
        responsibleName,
        serviceType: faker.helpers.arrayElement(SERVICE_TYPES),
        unit: host?.unit ?? null,
        authorizedBy: host?.fullName ?? 'Administração',
        documentEncrypted: encryptText(document),
        emailEncrypted: encryptOptional(maybe(0.5, () => faker.internet.email().toLowerCase())),
        phoneEncrypted: encryptOptional(maybe(0.8, randomPhone)),
        observationsEncrypted: encryptOptional(maybe(0.2, () => faker.lorem.sentence())),
        vehiclePlateEncrypted: hasVehicle ? encryptText(randomPlate()) : null,
        vehicleBrandModel: hasVehicle
          ? faker.helpers.arrayElement([
              'Fiat Fiorino',
              'Renault Kangoo',
              'VW Saveiro',
              'Fiat Strada',
            ])
          : null,
        vehicleColor: hasVehicle ? randomColor() : null,
        createdByUserId: randomUserId(),
        createdAt:
          i < 3
            ? randomTimestampToday(now, random)
            : randomPastDateAt(now, DAYS_BACK * 2, random, BUSINESS_HOUR_WEIGHTS),
      })

      providers.push({ responsibleName, companyName, unit: host?.unit ?? null, document })
    }
    await insertInBatches(providerRows, (data) => prisma.serviceProvider.createMany({ data }))

    // --- Autorizações (vencidas, vigentes e futuras) -----------------------
    // As 3 primeiras são vigentes e cadastradas HOJE; depois alterna vencida/vigente/futura.
    const authorized: { name: string; unit: string; document: string }[] = []
    const authorizationRows: Prisma.AuthorizationCreateManyInput[] = []

    for (let i = 0; i < COUNTS.authorizations; i++) {
      const host = randomResident()
      const scenario = i < 3 ? 1 : i % 3 // 0 = vencida, 1 = vigente, 2 = futura
      const start =
        scenario === 0
          ? addDays(now, -faker.number.int({ min: 5, max: 20 }))
          : scenario === 1
            ? addDays(now, -faker.number.int({ min: 0, max: 3 }))
            : addDays(now, faker.number.int({ min: 2, max: 15 }))
      const end =
        scenario === 0
          ? addDays(now, -faker.number.int({ min: 1, max: 4 }))
          : addDays(start, faker.number.int({ min: 3, max: 10 }))
      const personType = faker.helpers.arrayElement(AUTHORIZATION_PERSON_TYPES)
      const name = faker.person.fullName()
      const document = randomCpf()

      authorizationRows.push({
        id: uuid(),
        condominiumId,
        authorizedName: name,
        personType,
        documentEncrypted: encryptText(document),
        phoneEncrypted: encryptOptional(maybe(0.6, randomPhone)),
        company: personType === 'prestador_servico' ? faker.company.name() : null,
        unit: host.unit,
        authorizedBy: host.fullName,
        validFromDate: toDateString(start),
        validFromTime: '08:00',
        validToDate: toDateString(end),
        validToTime: '18:00',
        observationsEncrypted: encryptOptional(maybe(0.3, () => faker.lorem.sentence())),
        createdByUserId: randomUserId(),
        // Cadastro sempre no passado (ou hoje, até agora), mesmo para autorizações futuras.
        createdAt: i < 3 ? randomTimestampToday(now, random) : randomPastDate(DAYS_BACK),
      })

      if (scenario !== 2) {
        authorized.push({ name, unit: host.unit, document })
      }
    }
    await insertInBatches(authorizationRows, (data) => prisma.authorization.createMany({ data }))

    // --- Registros de acesso ----------------------------------------------
    type AccessPersonSeed = {
      category: string
      name: string
      unit: string | null
      document: string | null
    }

    const pickPerson = (category: AccessCategory): AccessPersonSeed => {
      switch (category) {
        case 'morador': {
          const r = randomResident()
          return {
            category,
            name: r.fullName,
            unit: faker.helpers.arrayElement(r.units),
            document: r.document,
          }
        }
        case 'visitante': {
          const v = faker.helpers.arrayElement(visitors)
          return { category, name: v.fullName, unit: v.unit, document: v.document }
        }
        case 'prestador_servico': {
          const p = faker.helpers.arrayElement(providers)
          return { category, name: p.responsibleName, unit: p.unit, document: p.document }
        }
        case 'autorizado': {
          const a = authorized.length > 0 ? faker.helpers.arrayElement(authorized) : null
          return a
            ? { category, name: a.name, unit: a.unit, document: a.document }
            : { category, name: faker.person.fullName(), unit: randomUnit(), document: randomCpf() }
        }
      }
    }

    const accessRows: Prisma.AccessRecordCreateManyInput[] = []
    const accessPersonRows: Prisma.AccessRecordPersonCreateManyInput[] = []

    /** Monta um registro de acesso (e suas pessoas). `open` = ainda dentro do condomínio. */
    const buildAccessRecord = (checkInAt: Date, category: AccessCategory, open: boolean): void => {
      const peopleCount = faker.helpers.weightedArrayElement([
        { weight: 7, value: 1 },
        { weight: 2, value: 2 },
        { weight: 1, value: 3 },
      ])
      const people = Array.from({ length: peopleCount }, (_, index) =>
        pickPerson(index === 0 ? category : faker.helpers.weightedArrayElement(CATEGORY_WEIGHTS)),
      )
      const locomotion = faker.helpers.weightedArrayElement([...LOCOMOTION_WEIGHTS])
      const hasVehicle =
        locomotion === 'carro' || locomotion === 'moto' || locomotion === 'caminhao'

      // Permanência coerente com a categoria; nunca depois de `now`.
      let checkOutAt: Date | null = null
      if (!open) {
        const desired = addMinutes(checkInAt, randomInt(STAY_MINUTES[category]))
        checkOutAt = clampToNow(desired, now)
        if (checkOutAt.getTime() <= checkInAt.getTime()) {
          checkOutAt = clampToNow(addMinutes(checkInAt, 1), now)
        }
      }
      const checkOutUser = checkOutAt ? randomUserId() : null
      // Registros abertos com várias pessoas: a primeira já saiu (saída parcial).
      const partialCheckout = open && peopleCount > 1
      const id = uuid()

      accessRows.push({
        id,
        condominiumId,
        company:
          category === 'prestador_servico'
            ? faker.helpers.arrayElement(providers).companyName
            : null,
        locomotion,
        color: hasVehicle ? randomColor() : null,
        plateEncrypted: hasVehicle ? encryptText(randomPlate()) : null,
        brandModel: hasVehicle
          ? faker.helpers.arrayElement(locomotion === 'moto' ? MOTO_MODELS : CAR_MODELS)
          : null,
        observationsEncrypted: encryptOptional(maybe(0.2, () => faker.lorem.sentence())),
        checkOutObservationsEncrypted: checkOutAt
          ? encryptOptional(maybe(0.15, () => faker.lorem.sentence()))
          : null,
        checkInAt,
        checkOutAt,
        checkedInByUserId: randomUserId(),
        checkedOutByUserId: checkOutUser,
        createdAt: checkInAt,
      })

      people.forEach((person, index) => {
        const personCheckOut = checkOutAt
          ? checkOutAt
          : partialCheckout && index === 0
            ? clampToNow(addMinutes(checkInAt, 10), now)
            : null
        accessPersonRows.push({
          id: uuid(),
          accessRecordId: id,
          category: person.category,
          name: person.name,
          unit: person.unit,
          documentEncrypted: encryptOptional(person.document),
          checkOutAt: personCheckOut,
          checkedOutByUserId: personCheckOut ? (checkOutUser ?? randomUserId()) : null,
        })
      })
    }

    const hoursFor = (category: AccessCategory): readonly number[] =>
      category === 'prestador_servico' ? BUSINESS_HOUR_WEIGHTS : GENERAL_HOUR_WEIGHTS
    // Categorias garantidas nos primeiros acessos de hoje (visitante e prestador nunca faltam).
    const guaranteedTodayCategories: AccessCategory[] = [
      'visitante',
      'prestador_servico',
      'morador',
      'autorizado',
    ]

    for (let offset = DAYS_BACK; offset >= 0; offset--) {
      const day = addDays(todayStart, -offset)
      const isWeekend = day.getDay() === 0 || day.getDay() === 6
      const base = randomInt(isWeekend ? ACCESS_PER_WEEKEND_DAY : ACCESS_PER_WEEKDAY)
      // Hoje: só a parcela do movimento diário que já deveria ter acontecido até agora.
      const count =
        offset === 0
          ? Math.max(MIN_CLOSED_ACCESS_TODAY, Math.round(base * elapsedDayFraction(now)))
          : base

      for (let i = 0; i < count; i++) {
        const category =
          offset === 0 && i < guaranteedTodayCategories.length
            ? (guaranteedTodayCategories[i] ?? 'morador')
            : faker.helpers.weightedArrayElement(CATEGORY_WEIGHTS)
        buildAccessRecord(randomTimeOnDay(day, now, random, hoursFor(category)), category, false)
      }
    }

    // Pessoas que estão dentro agora (entraram nas últimas horas de hoje, sem saída).
    const openCount = randomInt(OPEN_ACCESS_RECORDS)
    const openFrom = new Date(Math.max(todayStart.getTime(), addMinutes(now, -240).getTime()))
    for (let i = 0; i < openCount; i++) {
      const category = faker.helpers.weightedArrayElement(CATEGORY_WEIGHTS)
      const checkInAt = new Date(
        openFrom.getTime() + Math.floor(random() * (now.getTime() - openFrom.getTime() + 1)),
      )
      buildAccessRecord(checkInAt, category, true)
    }

    await insertInBatches(accessRows, (data) => prisma.accessRecord.createMany({ data }))
    await insertInBatches(accessPersonRows, (data) =>
      prisma.accessRecordPerson.createMany({ data }),
    )

    // --- Eventos (passados, hoje e futuros) --------------------------------
    const eventRows: Prisma.EventCreateManyInput[] = []
    const eventVehicleRows: Prisma.EventVehicleCreateManyInput[] = []
    const eventGuestRows: Prisma.EventGuestCreateManyInput[] = []
    let todayEventIndex = 0

    for (let i = 0; i < COUNTS.events; i++) {
      const offset = EVENT_DAY_OFFSETS[i % EVENT_DAY_OFFSETS.length] ?? 0
      const host = randomResident()
      const eventDate = addDays(todayStart, offset)
      const isPast = offset < 0
      const isToday = offset === 0
      const isFirstToday = isToday && todayEventIndex === 0
      if (isToday) todayEventIndex++

      // Hoje: o 1º evento já começou (até 2 h atrás, nunca antes de 00:00); o 2º é à noite.
      let startAt = new Date(eventDate)
      if (isFirstToday) {
        startAt = new Date(Math.max(todayStart.getTime(), addMinutes(now, -120).getTime()))
        startAt.setSeconds(0, 0)
      } else if (isToday) {
        startAt.setHours(20, 0, 0, 0)
      } else {
        startAt.setHours(faker.number.int({ min: 12, max: 19 }), 0, 0, 0)
      }
      const started = startAt.getTime() <= now.getTime()
      const endAt = addMinutes(startAt, 240)
      const eventId = uuid()

      eventRows.push({
        id: eventId,
        condominiumId,
        title: `${faker.helpers.arrayElement(EVENT_TITLES)} - ${host.fullName.split(' ')[0]}`,
        date: toDateString(eventDate),
        startTime: toTimeString(startAt),
        endTime: maybe(0.8, () =>
          endAt.getDate() === startAt.getDate() ? toTimeString(endAt) : '23:59',
        ),
        unit: host.unit,
        space: maybe(0.85, () => faker.helpers.arrayElement(EVENT_SPACES)),
        responsibleName: host.fullName,
        observationsEncrypted: encryptOptional(maybe(0.3, () => faker.lorem.sentence())),
        createdByUserId: randomUserId(),
        // Cadastro sempre no passado (ou hoje, até agora), mesmo para eventos futuros.
        createdAt: isFirstToday
          ? randomTimestampToday(now, random)
          : clampToNow(addDays(eventDate, -faker.number.int({ min: 2, max: 15 })), now),
      })

      // Veículos só existem para eventos que já começaram.
      const vehicleIds: string[] = []
      let dropOffVehicleId: string | null = null
      let pickUpVehicleId: string | null = null
      if (started) {
        const movements = [
          ...Array.from(
            { length: faker.number.int({ min: 3, max: 5 }) },
            () => 'CONVIDADO' as const,
          ),
          'DESEMBARQUE' as const,
          'BUSCA' as const,
        ]
        for (const movementType of movements) {
          const checkInAt = clampToNow(
            addMinutes(startAt, faker.number.int({ min: 0, max: 90 })),
            now,
          )
          const leftAlready = isPast || movementType !== 'CONVIDADO'
          const vehicleId = uuid()
          eventVehicleRows.push({
            id: vehicleId,
            eventId,
            plateEncrypted: encryptText(randomPlate()),
            brandModel: faker.helpers.arrayElement(CAR_MODELS),
            driverName: faker.person.fullName(),
            driverDocumentEncrypted: encryptOptional(maybe(0.6, randomCpf)),
            color: randomColor(),
            movementType,
            checkInAt,
            checkOutAt: leftAlready
              ? clampToNow(addMinutes(checkInAt, movementType === 'CONVIDADO' ? 200 : 5), now)
              : null,
            checkedInByUserId: randomUserId(),
            checkedOutByUserId: leftAlready ? randomUserId() : null,
          })
          if (movementType === 'CONVIDADO') vehicleIds.push(vehicleId)
          if (movementType === 'DESEMBARQUE') dropOffVehicleId = vehicleId
          if (movementType === 'BUSCA') pickUpVehicleId = vehicleId
        }
      }

      const guestCount = faker.number.int({ min: 8, max: 25 })
      for (let g = 0; g < guestCount; g++) {
        const isAdHoc = started && g >= guestCount - 2
        // Não começou: ninguém entrou. Passado: maioria entrou e saiu. Hoje: parte dentro, parte não chegou.
        const arrived = !started
          ? false
          : isPast
            ? faker.datatype.boolean({ probability: 0.85 })
            : isAdHoc || g % 3 !== 0
        const checkInAt = arrived
          ? clampToNow(addMinutes(startAt, faker.number.int({ min: 0, max: 120 })), now)
          : null
        const left = arrived && (isPast || g % 4 === 0)
        // Entrada: a pé, no próprio veículo de convidado ou deixado por um desembarque.
        const entryVehicleId = arrived
          ? faker.helpers.weightedArrayElement([
              { weight: 5, value: null },
              {
                weight: 3,
                value: vehicleIds.length > 0 ? faker.helpers.arrayElement(vehicleIds) : null,
              },
              { weight: 2, value: dropOffVehicleId },
            ])
          : null
        // Saída: no mesmo veículo de convidado, buscado por outro veículo ou a pé.
        const exitVehicleId = left
          ? entryVehicleId && vehicleIds.includes(entryVehicleId)
            ? entryVehicleId
            : faker.helpers.weightedArrayElement([
                { weight: 6, value: null },
                { weight: 4, value: pickUpVehicleId },
              ])
          : null

        eventGuestRows.push({
          id: uuid(),
          eventId,
          name: faker.person.fullName(),
          documentEncrypted: encryptOptional(maybe(0.6, randomCpf)),
          isAdHoc,
          entryVehicleId,
          exitVehicleId,
          checkInAt,
          checkOutAt:
            left && checkInAt
              ? clampToNow(addMinutes(checkInAt, faker.number.int({ min: 60, max: 240 })), now)
              : null,
          checkedInByUserId: checkInAt ? randomUserId() : null,
          checkedOutByUserId: left ? randomUserId() : null,
        })
      }
    }
    // Ordem das FKs: evento -> veículos -> convidados (referenciam os veículos).
    await insertInBatches(eventRows, (data) => prisma.event.createMany({ data }))
    await insertInBatches(eventVehicleRows, (data) => prisma.eventVehicle.createMany({ data }))
    await insertInBatches(eventGuestRows, (data) => prisma.eventGuest.createMany({ data }))

    // --- Ocorrências --------------------------------------------------------
    // As primeiras são de HOJE (entre 00:00 e agora); as demais, espalhadas nos últimos dias.
    const incidentRows: Prisma.IncidentCreateManyInput[] = []
    for (let i = 0; i < COUNTS.incidents; i++) {
      const occurredAt =
        i < INCIDENTS_TODAY ? randomTimestampToday(now, random) : randomPastDate(DAYS_BACK)

      incidentRows.push({
        id: uuid(),
        condominiumId,
        occurrenceType: faker.helpers.weightedArrayElement([...OCCURRENCE_TYPE_WEIGHTS]),
        date: toDateString(occurredAt),
        time: toTimeString(occurredAt),
        reportEncrypted: encryptText(faker.lorem.paragraph()),
        placeEncrypted: encryptOptional(
          maybe(0.8, () => faker.helpers.arrayElement(INCIDENT_PLACES)),
        ),
        createdByUserId: randomUserId(),
        createdAt: occurredAt,
      })
    }
    await insertInBatches(incidentRows, (data) => prisma.incident.createMany({ data }))

    // --- Resumo -------------------------------------------------------------
    const where = { condominiumId }
    const [
      moradores,
      visitantes,
      prestadores,
      autorizacoes,
      acessos,
      acessosAbertos,
      eventos,
      ocorrencias,
    ] = await Promise.all([
      prisma.resident.count({ where }),
      prisma.visitor.count({ where }),
      prisma.serviceProvider.count({ where }),
      prisma.authorization.count({ where }),
      prisma.accessRecord.count({ where }),
      prisma.accessRecord.count({ where: { condominiumId, checkOutAt: null } }),
      prisma.event.count({ where }),
      prisma.incident.count({ where }),
    ])
    const summary = {
      moradores,
      visitantes,
      prestadores,
      autorizacoes,
      acessos,
      acessosAbertos,
      eventos,
      ocorrencias,
    }

    const elapsedSeconds = ((performance.now() - startedAt) / 1000).toFixed(1).replace('.', ',')
    console.log('\nSeed concluído para o condomínio "%s" em %s s:', TENANT_SLUG, elapsedSeconds)
    console.table(summary)
    console.log('Acesse http://demo.localhost:3000 com:')
    for (const spec of DEMO_USERS) {
      console.log(`  ${spec.role.padEnd(10)} ${spec.email} / ${DEMO_PASSWORD}`)
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
