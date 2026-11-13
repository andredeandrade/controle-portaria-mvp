import type { AccessRecord } from '@/app/api/access-records/types'

export type AccessListViewMode = 'all' | 'active' | 'exited'

export type AccessRecordCategoryUnit = {
  id: string
  label: string
  category: string
  categoryLabel: string
  unit: string | null
}

export type AccessRecordListItem = {
  id: string
  name: string
  categoryUnits: AccessRecordCategoryUnit[]
  locomotion: string
  plate: string
  entryAt: string
  exitAt: string
  hasExited: boolean
  people: Array<{
    id: string
    name: string
    isOpen: boolean
  }>
}

export type AccessRecordsPaginationState = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export const ACCESS_PERSON_CATEGORY_LABEL: Record<string, string> = {
  morador: 'Morador',
  visitante: 'Visitante',
  prestador_servico: 'Prestador de serviço',
  autorizado: 'Autorizado',
}

export const ACCESS_LOCOMOTION_LABEL: Record<string, string> = {
  a_pe: 'A pe',
  carro: 'Carro',
  moto: 'Moto',
  bicicleta: 'Bicicleta',
  caminhao: 'Caminhao',
  outro: 'Outro',
}

function buildCategoryUnitLabel(person: { category: string; unit: string | null }): string {
  const categoryRaw = person.category ?? ''
  const category = (ACCESS_PERSON_CATEGORY_LABEL[categoryRaw] ?? categoryRaw) || '-'

  const unitValue = person.unit?.trim()
  return category !== '-' ? (unitValue ? `${category}: ${unitValue}` : category) : '-'
}

export function formatAccessRecord(item: AccessRecord): AccessRecordListItem {
  const peopleToDisplay = item.isOpen ? item.people.filter((person) => person.isOpen) : item.people
  const name =
    peopleToDisplay
      .map((person) => person.name.trim())
      .filter((personName) => personName.length > 0)
      .join(', ') ||
    item.people
      .map((person) => person.name.trim())
      .filter((personName) => personName.length > 0)
      .join(', ') ||
    '-'

  const peopleForCategoryUnits = peopleToDisplay.length > 0 ? peopleToDisplay : item.people
  const categoryUnits = peopleForCategoryUnits.map((person) => ({
    id: person.id,
    label: buildCategoryUnitLabel(person),
    category: person.category,
    categoryLabel:
      (ACCESS_PERSON_CATEGORY_LABEL[person.category ?? ''] ?? person.category ?? '') || '-',
    unit: person.unit?.trim() || null,
  }))

  const locomotionRaw = item.locomotion ?? ''
  const locomotion = (ACCESS_LOCOMOTION_LABEL[locomotionRaw] ?? locomotionRaw) || '-'

  const checkInDate = new Date(item.checkInAt)
  const entryAt = Number.isNaN(checkInDate.getTime())
    ? item.checkInAt
    : new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(checkInDate)

  const checkOutDate = item.checkOutAt ? new Date(item.checkOutAt) : null
  const exitAt =
    !checkOutDate || Number.isNaN(checkOutDate.getTime())
      ? 'Em aberto'
      : new Intl.DateTimeFormat('pt-BR', {
          dateStyle: 'short',
          timeStyle: 'short',
        }).format(checkOutDate)

  return {
    id: item.id,
    name,
    categoryUnits,
    locomotion,
    plate: item.plate?.trim() ? item.plate : '-',
    entryAt,
    exitAt,
    hasExited: !item.isOpen,
    people: item.people.map((person) => ({
      id: person.id,
      name: person.name,
      isOpen: person.isOpen,
    })),
  }
}
