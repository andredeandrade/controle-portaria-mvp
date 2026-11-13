import { describe, expect, it } from 'vitest'

import { buildAccessPerson, buildAccessRecord } from '@test/factories/access-records'

import { formatAccessRecord } from './acessos'

describe('formatAccessRecord', () => {
  it('em registro aberto mostra só as pessoas que ainda estão dentro', () => {
    const record = buildAccessRecord({
      people: [
        buildAccessPerson({ id: 'p-1', name: 'Joana Fictícia', isOpen: false }),
        buildAccessPerson({
          id: 'p-2',
          name: 'Pedro Fictício',
          category: 'morador',
          unit: ' B-2 ',
        }),
      ],
    })

    const item = formatAccessRecord(record)

    expect(item.name).toBe('Pedro Fictício')
    expect(item.categoryUnits).toEqual([
      {
        id: 'p-2',
        label: 'Morador: B-2',
        category: 'morador',
        categoryLabel: 'Morador',
        unit: 'B-2',
      },
    ])
    expect(item.people).toHaveLength(2)
    expect(item.hasExited).toBe(false)
    expect(item.exitAt).toBe('Em aberto')
  })

  it('em registro encerrado mostra todas as pessoas e a data de saída', () => {
    const record = buildAccessRecord({
      isOpen: false,
      checkOutAt: '2026-11-12T15:00:00.000Z',
      people: [
        buildAccessPerson({ id: 'p-1', name: 'Joana Fictícia', isOpen: false }),
        buildAccessPerson({ id: 'p-2', name: 'Pedro Fictício', isOpen: false }),
      ],
    })

    const item = formatAccessRecord(record)

    expect(item.name).toBe('Joana Fictícia, Pedro Fictício')
    expect(item.hasExited).toBe(true)
    expect(item.exitAt).not.toBe('Em aberto')
  })

  it('traduz locomoção e usa "-" para placa vazia e categoria desconhecida vazia', () => {
    const item = formatAccessRecord(
      buildAccessRecord({
        locomotion: 'a_pe',
        plate: '  ',
        people: [buildAccessPerson({ category: '', unit: null })],
      }),
    )

    expect(item.locomotion).toBe('A pe')
    expect(item.plate).toBe('-')
    expect(item.categoryUnits[0]).toMatchObject({ label: '-', categoryLabel: '-', unit: null })
  })

  it('mantém valores de data inválidos como vieram', () => {
    expect(formatAccessRecord(buildAccessRecord({ checkInAt: 'data-invalida' })).entryAt).toBe(
      'data-invalida',
    )
  })
})
