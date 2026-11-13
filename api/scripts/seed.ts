/**
 * Seed de dados fictícios para testes locais.
 *
 * Cria (ou recria) o condomínio de teste "demo" com dados em todos os módulos.
 * Só apaga dados do condomínio "demo" — outros condomínios ficam intactos.
 * Só roda em banco local, ou em banco remoto com SEED_ALLOW_REMOTE=demo
 * (veja src/lib/seed-guard.ts). Sempre bloqueado com NODE_ENV=production.
 *
 * Uso: pnpm --filter ./api seed
 * Login: http://demo.localhost:3000 com admin@demo.local / Senha@123
 */

import 'dotenv/config'
import { fakerPT_BR as faker } from '@faker-js/faker'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma-client/client.js'
import { encryptText } from '../src/lib/crypto.js'
import { hashPassword } from '../src/lib/password.js'
import { assertSeedAllowed } from '../src/lib/seed-guard.js'

// ---------------------------------------------------------------------------
// Configuração
// ---------------------------------------------------------------------------

const TENANT_SLUG = 'demo'
const TENANT_NAME = 'Condomínio Demo'
const DEFAULT_PASSWORD = 'Senha@123'

const COUNTS = {
  residents: 40,
  visitors: 25,
  serviceProviders: 15,
  authorizations: 15,
  accessRecords: 60,
  openAccessRecords: 6,
  events: 8,
  incidents: 20,
} as const

const DAYS_BACK = 30

// Valores iguais aos selects do front (web/src/modules/form/components e web/src/types/ocorrencias.ts)
const COLORS = ['branco', 'preto', 'prata', 'cinza', 'azul', 'vermelho', 'verde', 'amarelo'] as const
const LOCOMOTIONS = ['a_pe', 'carro', 'moto', 'bicicleta', 'caminhao', 'outro'] as const
const ACCESS_CATEGORIES = ['morador', 'visitante', 'prestador_servico', 'autorizado'] as const
const AUTHORIZATION_PERSON_TYPES = ['morador', 'visitante', 'prestador_servico'] as const
const OCCURRENCE_TYPES = [
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
const EVENT_SPACES = ['Salão de festas', 'Churrasqueira', 'Espaço gourmet', 'Área da piscina', 'Quadra']
const EVENT_TITLES = [
  'Aniversário',
  'Churrasco de família',
  'Chá de bebê',
  'Confraternização',
  'Festa infantil',
  'Reunião de amigos',
]
const INCIDENT_PLACES = ['Portaria', 'Garagem', 'Bloco A', 'Bloco B', 'Bloco C', 'Piscina', 'Playground', 'Estacionamento']

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

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000)
}

/** Data aleatória entre `daysBack` dias atrás e agora, em horário comercial estendido. */
function randomPastDate(daysBack: number): Date {
  const date = addDays(new Date(), -faker.number.int({ min: 0, max: daysBack }))
  date.setHours(faker.number.int({ min: 6, max: 22 }), faker.number.int({ min: 0, max: 59 }), 0, 0)
  return date > new Date() ? addMinutes(new Date(), -faker.number.int({ min: 10, max: 300 })) : date
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

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
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
    const passwordHash = await hashPassword(DEFAULT_PASSWORD)
    const userSpecs = [
      { role: 'ADMIN', email: 'admin@demo.local', name: 'Admin Demo' },
      { role: 'GESTOR', email: 'gestor@demo.local', name: 'Gestor Demo' },
      { role: 'SINDICO', email: 'sindico@demo.local', name: 'Síndico Demo' },
      { role: 'SEGURANCA', email: 'seguranca@demo.local', name: 'Segurança Demo' },
    ] as const

    const users = await Promise.all(
      userSpecs.map((spec) =>
        prisma.user.create({ data: { ...spec, condominiumId, passwordHash } }),
      ),
    )
    const userIds = users.map((user) => user.id)
    const randomUserId = (): string => faker.helpers.arrayElement(userIds)

    // --- Moradores ----------------------------------------------------------
    // `unit` é a unidade principal (primeira), usada como destino nos demais módulos.
    const residents: { fullName: string; unit: string; units: string[]; document: string | null }[] = []

    for (let i = 0; i < COUNTS.residents; i++) {
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

      await prisma.resident.create({
        data: {
          condominiumId,
          fullName,
          units: { create: units.map((value, position) => ({ unit: value, position })) },
          relation: faker.helpers.arrayElement(['PROPRIETARIO', 'INQUILINO', 'DEPENDENTE'] as const),
          emailEncrypted: encryptOptional(maybe(0.7, () => faker.internet.email({ firstName: fullName.split(' ')[0] }).toLowerCase())),
          phoneEncrypted: encryptOptional(maybe(0.8, randomPhone)),
          documentEncrypted: encryptOptional(document),
          observationsEncrypted: encryptOptional(maybe(0.2, () => faker.lorem.sentence())),
          createdByUserId: randomUserId(),
          createdAt: randomPastDate(DAYS_BACK * 3),
          vehicles: {
            create: Array.from({ length: vehicleCount }, () => {
              const type = faker.helpers.weightedArrayElement([
                { weight: 8, value: 'CARRO' as const },
                { weight: 2, value: 'MOTO' as const },
              ])
              return {
                type,
                color: randomColor(),
                plateEncrypted: encryptText(randomPlate()),
                brandModel: faker.helpers.arrayElement(type === 'CARRO' ? CAR_MODELS : MOTO_MODELS),
              }
            }),
          },
        },
      })

      residents.push({ fullName, unit, units, document })
    }

    const randomResident = () => faker.helpers.arrayElement(residents)

    // --- Visitantes ---------------------------------------------------------
    const visitors: { fullName: string; unit: string; document: string }[] = []

    for (let i = 0; i < COUNTS.visitors; i++) {
      const host = randomResident()
      const fullName = faker.person.fullName()
      const document = randomCpf()
      const hasVehicle = faker.datatype.boolean({ probability: 0.4 })

      await prisma.visitor.create({
        data: {
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
          createdAt: randomPastDate(DAYS_BACK * 2),
        },
      })

      visitors.push({ fullName, unit: host.unit, document })
    }

    // --- Prestadores de serviço --------------------------------------------
    const providers: { responsibleName: string; companyName: string; unit: string | null; document: string }[] = []

    for (let i = 0; i < COUNTS.serviceProviders; i++) {
      const host = maybe(0.7, randomResident)
      const responsibleName = faker.person.fullName()
      const companyName = faker.company.name()
      const document = randomCpf()
      const hasVehicle = faker.datatype.boolean({ probability: 0.6 })

      await prisma.serviceProvider.create({
        data: {
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
          vehicleBrandModel: hasVehicle ? faker.helpers.arrayElement(['Fiat Fiorino', 'Renault Kangoo', 'VW Saveiro', 'Fiat Strada']) : null,
          vehicleColor: hasVehicle ? randomColor() : null,
          createdByUserId: randomUserId(),
          createdAt: randomPastDate(DAYS_BACK * 2),
        },
      })

      providers.push({ responsibleName, companyName, unit: host?.unit ?? null, document })
    }

    // --- Autorizações (vencidas, vigentes e futuras) -----------------------
    const authorized: { name: string; unit: string; document: string }[] = []
    const today = new Date()

    for (let i = 0; i < COUNTS.authorizations; i++) {
      const host = randomResident()
      const scenario = i % 3 // 0 = vencida, 1 = vigente, 2 = futura
      const start =
        scenario === 0
          ? addDays(today, -faker.number.int({ min: 5, max: 20 }))
          : scenario === 1
            ? addDays(today, -faker.number.int({ min: 0, max: 3 }))
            : addDays(today, faker.number.int({ min: 2, max: 15 }))
      const end =
        scenario === 0
          ? addDays(today, -faker.number.int({ min: 1, max: 4 }))
          : addDays(start, faker.number.int({ min: 3, max: 10 }))
      const personType = faker.helpers.arrayElement(AUTHORIZATION_PERSON_TYPES)
      const name = faker.person.fullName()
      const document = randomCpf()

      await prisma.authorization.create({
        data: {
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
        },
      })

      if (scenario === 1) {
        authorized.push({ name, unit: host.unit, document })
      }
    }

    // --- Registros de acesso ----------------------------------------------
    type AccessPersonSeed = { category: string; name: string; unit: string | null; document: string | null }

    const pickPerson = (category: (typeof ACCESS_CATEGORIES)[number]): AccessPersonSeed => {
      switch (category) {
        case 'morador': {
          const r = randomResident()
          return { category, name: r.fullName, unit: faker.helpers.arrayElement(r.units), document: r.document }
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

    for (let i = 0; i < COUNTS.accessRecords; i++) {
      const isOpen = i < COUNTS.openAccessRecords
      const checkInAt = isOpen
        ? addMinutes(new Date(), -faker.number.int({ min: 15, max: 240 }))
        : randomPastDate(DAYS_BACK)
      const category = faker.helpers.arrayElement(ACCESS_CATEGORIES)
      const peopleCount = faker.helpers.weightedArrayElement([
        { weight: 7, value: 1 },
        { weight: 2, value: 2 },
        { weight: 1, value: 3 },
      ])
      const people = Array.from({ length: peopleCount }, (_, index) =>
        pickPerson(index === 0 ? category : faker.helpers.arrayElement(ACCESS_CATEGORIES)),
      )
      const locomotion = faker.helpers.arrayElement(LOCOMOTIONS)
      const hasVehicle = locomotion === 'carro' || locomotion === 'moto' || locomotion === 'caminhao'
      const checkOutAt = isOpen ? null : addMinutes(checkInAt, faker.number.int({ min: 10, max: 300 }))
      const checkInUser = randomUserId()
      const checkOutUser = checkOutAt ? randomUserId() : null
      // Registros abertos com várias pessoas: a primeira já saiu (saída parcial).
      const partialCheckout = isOpen && peopleCount > 1

      await prisma.accessRecord.create({
        data: {
          condominiumId,
          company: category === 'prestador_servico' ? faker.helpers.arrayElement(providers).companyName : null,
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
          checkedInByUserId: checkInUser,
          checkedOutByUserId: checkOutUser,
          createdAt: checkInAt,
          people: {
            create: people.map((person, index) => {
              const personCheckOut = checkOutAt
                ? checkOutAt
                : partialCheckout && index === 0
                  ? addMinutes(checkInAt, 10)
                  : null
              return {
                category: person.category,
                name: person.name,
                unit: person.unit,
                documentEncrypted: encryptOptional(person.document),
                checkOutAt: personCheckOut,
                checkedOutByUserId: personCheckOut ? (checkOutUser ?? randomUserId()) : null,
              }
            }),
          },
        },
      })
    }

    // --- Eventos (passados, hoje e futuros) --------------------------------
    const eventDayOffsets = [-20, -10, -3, 0, 0, 3, 7, 14]

    for (let i = 0; i < COUNTS.events; i++) {
      const offset = eventDayOffsets[i % eventDayOffsets.length] ?? 0
      const host = randomResident()
      const eventDate = addDays(today, offset)
      const isPast = offset < 0
      const isToday = offset === 0
      const startHour = isToday ? Math.max(8, today.getHours() - 2) : faker.number.int({ min: 12, max: 19 })
      const startAt = new Date(eventDate)
      startAt.setHours(Math.min(startHour, 21), 0, 0, 0)

      const event = await prisma.event.create({
        data: {
          condominiumId,
          title: `${faker.helpers.arrayElement(EVENT_TITLES)} - ${host.fullName.split(' ')[0]}`,
          date: toDateString(eventDate),
          startTime: toTimeString(startAt),
          endTime: maybe(0.8, () => toTimeString(addMinutes(startAt, 240))),
          unit: host.unit,
          space: maybe(0.85, () => faker.helpers.arrayElement(EVENT_SPACES)),
          responsibleName: host.fullName,
          observationsEncrypted: encryptOptional(maybe(0.3, () => faker.lorem.sentence())),
          createdByUserId: randomUserId(),
          // Cadastro sempre no passado, mesmo para eventos futuros.
          createdAt: new Date(
            Math.min(addDays(eventDate, -faker.number.int({ min: 2, max: 15 })).getTime(), Date.now()),
          ),
        },
      })

      // Veículos só existem para eventos que já começaram.
      const vehicleIds: string[] = []
      let dropOffVehicleId: string | null = null
      let pickUpVehicleId: string | null = null
      if (isPast || isToday) {
        const movements = ['CONVIDADO', 'CONVIDADO', 'DESEMBARQUE', 'BUSCA'] as const
        for (const movementType of movements) {
          const checkInAt = addMinutes(startAt, faker.number.int({ min: 0, max: 90 }))
          const leftAlready = isPast || movementType !== 'CONVIDADO'
          const vehicle = await prisma.eventVehicle.create({
            data: {
              eventId: event.id,
              plateEncrypted: encryptText(randomPlate()),
              brandModel: faker.helpers.arrayElement(CAR_MODELS),
              driverName: faker.person.fullName(),
              driverDocumentEncrypted: encryptOptional(maybe(0.6, randomCpf)),
              color: randomColor(),
              movementType,
              checkInAt,
              checkOutAt: leftAlready ? addMinutes(checkInAt, movementType === 'CONVIDADO' ? 200 : 5) : null,
              checkedInByUserId: randomUserId(),
              checkedOutByUserId: leftAlready ? randomUserId() : null,
            },
          })
          if (movementType === 'CONVIDADO') vehicleIds.push(vehicle.id)
          if (movementType === 'DESEMBARQUE') dropOffVehicleId = vehicle.id
          if (movementType === 'BUSCA') pickUpVehicleId = vehicle.id
        }
      }

      const guestCount = faker.number.int({ min: 8, max: 20 })
      for (let g = 0; g < guestCount; g++) {
        const isAdHoc = (isPast || isToday) && g >= guestCount - 2
        // Futuro: ninguém entrou. Passado: maioria entrou e saiu. Hoje: parte dentro, parte não chegou.
        const arrived = isPast ? faker.datatype.boolean({ probability: 0.85 }) : isToday ? isAdHoc || g % 3 !== 0 : false
        const checkInAt = arrived ? addMinutes(startAt, faker.number.int({ min: 0, max: 120 })) : null
        const left = arrived && (isPast || g % 4 === 0)
        // Entrada: a pé, no próprio veículo de convidado ou deixado por um desembarque.
        const entryVehicleId = arrived
          ? faker.helpers.weightedArrayElement([
              { weight: 5, value: null },
              { weight: 3, value: vehicleIds.length > 0 ? faker.helpers.arrayElement(vehicleIds) : null },
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

        await prisma.eventGuest.create({
          data: {
            eventId: event.id,
            name: faker.person.fullName(),
            documentEncrypted: encryptOptional(maybe(0.6, randomCpf)),
            isAdHoc,
            entryVehicleId,
            exitVehicleId,
            checkInAt,
            checkOutAt: left && checkInAt ? addMinutes(checkInAt, faker.number.int({ min: 60, max: 240 })) : null,
            checkedInByUserId: checkInAt ? randomUserId() : null,
            checkedOutByUserId: left ? randomUserId() : null,
          },
        })
      }
    }

    // --- Ocorrências --------------------------------------------------------
    for (let i = 0; i < COUNTS.incidents; i++) {
      const occurredAt = randomPastDate(DAYS_BACK)

      await prisma.incident.create({
        data: {
          condominiumId,
          occurrenceType: faker.helpers.arrayElement(OCCURRENCE_TYPES),
          date: toDateString(occurredAt),
          time: toTimeString(occurredAt),
          reportEncrypted: encryptText(faker.lorem.paragraph()),
          placeEncrypted: encryptOptional(maybe(0.8, () => faker.helpers.arrayElement(INCIDENT_PLACES))),
          createdByUserId: randomUserId(),
          createdAt: occurredAt,
        },
      })
    }

    // --- Resumo -------------------------------------------------------------
    const where = { condominiumId }
    const summary = {
      moradores: await prisma.resident.count({ where }),
      visitantes: await prisma.visitor.count({ where }),
      prestadores: await prisma.serviceProvider.count({ where }),
      autorizacoes: await prisma.authorization.count({ where }),
      acessos: await prisma.accessRecord.count({ where }),
      acessosAbertos: await prisma.accessRecord.count({ where: { condominiumId, checkOutAt: null } }),
      eventos: await prisma.event.count({ where }),
      ocorrencias: await prisma.incident.count({ where }),
    }

    console.log('\nSeed concluído para o condomínio "%s":', TENANT_SLUG)
    console.table(summary)
    console.log('Acesse http://demo.localhost:3000 com:')
    for (const spec of userSpecs) {
      console.log(`  ${spec.role.padEnd(10)} ${spec.email} / ${DEFAULT_PASSWORD}`)
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
