import type { CreateAccessRecordRequest } from '@/app/api/access-records/types'
import type { CreateAuthorizationRequest } from '@/app/api/authorizations/types'
import type { CreateEventRequest } from '@/app/api/events/types'
import type { CreateIncidentRequest } from '@/app/api/incidents/types'
import type { CreateResidentRequest } from '@/app/api/residents/types'
import type { CreateServiceProviderRequest } from '@/app/api/service-providers/types'

/** Payloads fictícios de criação, no formato aceito pelos services/BFF. */

export const NOVO_MORADOR: CreateResidentRequest = {
  fullName: 'Carlos Fictício',
  units: ['Bloco B - 202'],
  relation: 'proprietario',
  document: '98765432',
}

export const NOVA_AUTORIZACAO: CreateAuthorizationRequest = {
  authorizedName: 'Ana Fictícia',
  personType: 'visitante',
  document: '11122233',
  unit: 'Bloco A - 101',
  authorizedBy: 'Morador Fictício',
  validFromDate: '2026-11-12',
  validFromTime: '08:00',
  validToDate: '2026-11-12',
  validToTime: '18:00',
}

export const NOVA_OCORRENCIA: CreateIncidentRequest = {
  occurrenceType: 'Barulho',
  date: '2026-11-12',
  time: '23:10',
  report: 'Relato fictício.',
  place: 'Salão de festas',
}

export const NOVO_PRESTADOR: CreateServiceProviderRequest = {
  companyName: 'Empresa Fictícia Ltda',
  responsibleName: 'Paulo Fictício',
  document: '44455566',
  serviceType: 'Manutenção',
  authorizedBy: 'Síndico Fictício',
}

export const NOVO_EVENTO: CreateEventRequest = {
  title: 'Aniversário Fictício',
  date: '2026-12-01',
  startTime: '19:00',
  unit: 'Bloco A - 101',
  responsibleName: 'Morador Fictício',
  guests: [{ name: 'Convidado Fictício' }],
}

export const NOVA_ENTRADA: CreateAccessRecordRequest = {
  people: [{ category: 'visitante', name: 'Joana Fictícia', document: '12345678', unit: 'A-101' }],
  locomotion: 'carro',
  plate: 'ABC1D23',
}
