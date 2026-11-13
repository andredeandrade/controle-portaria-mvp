import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { app } from '../app.js'
import { decryptText } from './crypto.js'
import { prisma } from './prisma.js'
import { authHeader, createTestTenant, type TestTenant } from '../../test/helpers/factories.js'

/** Valores de PII fictícios enviados pela API; nenhum pode aparecer em texto puro no banco. */
const PII = {
  email: 'pii.ficticio@exemplo.test',
  phone: '11 98888-7777',
  document: '987.654.321-00',
  observations: 'Observação sigilosa fictícia',
  plate: 'PII1A23',
  checkOutObservations: 'Saída sigilosa fictícia',
} as const

const PII_VALUES: readonly string[] = Object.values(PII)

interface EncryptedColumn {
  table_name: string
  column_name: string
}

async function seedPiiThroughApi(tenant: TestTenant): Promise<void> {
  const auth = authHeader(tenant.admin)

  await request(app)
    .post('/api/residents')
    .set('Authorization', auth)
    .send({
      fullName: 'Morador PII',
      units: ['101'],
      relation: 'inquilino',
      email: PII.email,
      phone: PII.phone,
      document: PII.document,
      observations: PII.observations,
      vehicles: [{ type: 'carro', plate: PII.plate, color: 'preto' }],
    })
    .expect(201)

  await request(app)
    .post('/api/visitors')
    .set('Authorization', auth)
    .send({
      fullName: 'Visitante PII',
      document: PII.document,
      phone: PII.phone,
      email: PII.email,
      unit: '101',
      authorizedBy: 'Morador PII',
      observations: PII.observations,
      vehiclePlate: PII.plate,
    })
    .expect(201)

  await request(app)
    .post('/api/authorizations')
    .set('Authorization', auth)
    .send({
      authorizedName: 'Autorizado PII',
      personType: 'visitante',
      document: PII.document,
      phone: PII.phone,
      unit: '101',
      authorizedBy: 'Morador PII',
      validFromDate: '2026-11-01',
      validFromTime: '08:00',
      validToDate: '2026-11-02',
      validToTime: '08:00',
      observations: PII.observations,
    })
    .expect(201)

  const checkIn = await request(app)
    .post('/api/access-records/check-in')
    .set('Authorization', auth)
    .send({
      people: [{ category: 'visitante', name: 'Pessoa PII', document: PII.document }],
      locomotion: 'carro',
      plate: PII.plate,
      observations: PII.observations,
    })
    .expect(201)

  await request(app)
    .post(`/api/access-records/${(checkIn.body as { id: string }).id}/check-out`)
    .set('Authorization', auth)
    .send({ observations: PII.checkOutObservations })
    .expect(200)
}

describe('PII em repouso (colunas *Encrypted)', () => {
  let tenant: TestTenant

  beforeEach(async () => {
    tenant = await createTestTenant('condominio-pii')
    await seedPiiThroughApi(tenant)
  })

  it('nenhuma coluna *Encrypted guarda texto puro e todas decifram com lib/crypto', async () => {
    const columns = await prisma.$queryRaw<EncryptedColumn[]>`
      SELECT table_name, column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND column_name LIKE '%Encrypted'
      ORDER BY table_name, column_name
    `

    expect(columns.length).toBeGreaterThan(0)

    const decryptedValues = new Set<string>()
    let checkedValues = 0

    for (const { table_name: table, column_name: column } of columns) {
      // Nomes vêm do information_schema, não de entrada do usuário.
      const rows = await prisma.$queryRawUnsafe<{ value: string }[]>(
        `SELECT "${column}" AS value FROM "public"."${table}" WHERE "${column}" IS NOT NULL`,
      )

      for (const { value } of rows) {
        checkedValues += 1

        for (const plain of PII_VALUES) {
          expect(value, `${table}.${column} contém PII em texto puro`).not.toContain(plain)
        }

        const decrypted = decryptText(value)
        decryptedValues.add(decrypted)
      }
    }

    expect(checkedValues).toBeGreaterThan(0)

    // Todo valor sensível enviado foi de fato persistido (cifrado) em algum lugar.
    for (const plain of PII_VALUES) {
      expect(decryptedValues.has(plain), `"${plain}" não foi encontrado cifrado`).toBe(true)
    }
  })

  it('a API devolve a PII decifrada para o próprio condomínio', async () => {
    const list = await request(app)
      .get('/api/residents')
      .set('Authorization', authHeader(tenant.admin))
      .expect(200)

    const [resident] = (list.body as { items: Record<string, unknown>[] }).items
    expect(resident).toMatchObject({
      email: PII.email,
      phone: PII.phone,
      document: PII.document,
      observations: PII.observations,
    })
  })
})
