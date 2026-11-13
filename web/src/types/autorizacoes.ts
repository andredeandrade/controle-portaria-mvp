import type { PersonTypeValue } from '@/modules/form/components/PersonTypeSelect'

export type AuthorizationRecord = {
  id: string
  authorizedName: string
  personType: string
  personTypeLabel: string
  document: string
  phone?: string
  company?: string
  observations?: string
  validFromDate: string
  validFromTime: string
  validToDate: string
  validToTime: string
  unit: string
  authorizedBy: string
}

export type AuthorizationsPaginationState = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export const PERSON_TYPE_LABEL: Record<PersonTypeValue, string> = {
  morador: 'Morador',
  visitante: 'Visitante',
  prestador_servico: 'Prestador de serviço',
}
