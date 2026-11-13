import type { AccessRecord, AccessRecordPerson } from '@/app/api/access-records/types'

/** Pessoa fictícia de um registro de acesso, no formato do BFF. */
export function buildAccessPerson(overrides: Partial<AccessRecordPerson> = {}): AccessRecordPerson {
  return {
    id: 'pessoa-1',
    category: 'visitante',
    name: 'Joana Fictícia',
    document: '12345678',
    unit: 'A-101',
    checkOutAt: null,
    checkedOutByUserId: null,
    checkOutObservations: null,
    isOpen: true,
    ...overrides,
  }
}

/** Registro de acesso fictício (em aberto por padrão). */
export function buildAccessRecord(overrides: Partial<AccessRecord> = {}): AccessRecord {
  return {
    id: 'acesso-1',
    people: [buildAccessPerson()],
    company: null,
    locomotion: 'carro',
    color: null,
    plate: 'ABC1D23',
    brandModel: null,
    observations: null,
    checkOutObservations: null,
    checkInAt: '2026-11-12T13:30:00.000Z',
    checkOutAt: null,
    checkedInByUserId: 'usuario-1',
    checkedOutByUserId: null,
    createdAt: '2026-11-12T13:30:00.000Z',
    updatedAt: '2026-11-12T13:30:00.000Z',
    isOpen: true,
    ...overrides,
  }
}
