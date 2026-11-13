import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import EventIcon from '@mui/icons-material/Event'
import HomeIcon from '@mui/icons-material/Home'
import PeopleIcon from '@mui/icons-material/People'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'
import type { SvgIconComponent } from '@mui/icons-material'

import type { UserOptions } from 'jspdf-autotable'

import type { EventVehicleMovementType } from '@/app/api/events/types'
import { MOVEMENT_LABEL } from '@/modules/eventos/components/EventVehicleMovementBadge'
import { ACCESS_PERSON_TYPE_OPTIONS, COLOR_OPTIONS, LOCOMOTION_OPTIONS } from '@/modules/form'
import {
  RESIDENT_RELATION_LABEL,
  VEHICLE_TYPE_LABEL,
  type ResidentRelationEnum,
  type VehicleTypeEnum,
} from '@/types/moradores'
import { PERSON_TYPE_LABEL } from '@/types/autorizacoes'
import { OCCURRENCE_TYPE_LABEL, type OccurrenceTypeEnum } from '@/types/ocorrencias'
import type { ReportModuleKey } from '@/types/relatorios'

type AccessPerson = {
  name: string
  category: string
  unit: string | null
  document: string | null
  checkOutAt: string | null
  checkOutObservations: string | null
  checkedOutByUserName: string | null
}

type AccessItem = {
  checkInAt: string
  checkOutAt: string | null
  people: AccessPerson[]
  company: string | null
  locomotion: string | null
  color: string | null
  plate: string | null
  brandModel: string | null
  observations: string | null
  checkOutObservations: string | null
  checkedInByUserName: string | null
  checkedOutByUserName: string | null
}

type VisitorItem = {
  fullName: string
  document: string
  unit: string
  authorizedBy: string
  phone: string | null
  email: string | null
  observations: string | null
  vehiclePlate: string | null
  vehicleBrandModel: string | null
  vehicleColor: string | null
  createdAt: string
  createdByUserName: string | null
}

type ServiceProviderItem = {
  companyName: string
  responsibleName: string
  document: string
  serviceType: string
  unit: string | null
  authorizedBy: string
  phone: string | null
  email: string | null
  observations: string | null
  vehiclePlate: string | null
  vehicleBrandModel: string | null
  vehicleColor: string | null
  createdAt: string
  createdByUserName: string | null
}

type IncidentItem = {
  date: string
  time: string
  occurrenceType: string
  report: string
  place: string | null
  createdByUserName: string | null
  createdAt: string
}

type ResidentVehicle = {
  type: string
  color: string | null
  plate: string | null
  brandModel: string | null
}

type ResidentItem = {
  fullName: string
  units: string[]
  relation: string
  document: string | null
  phone: string | null
  email: string | null
  observations: string | null
  vehicles: ResidentVehicle[]
  createdByUserName: string | null
  createdAt: string
}

/** Uma linha por veículo: "Carro · ABC1D23 · Prata · VW Gol". */
function formatResidentVehicles(vehicles: ResidentVehicle[]): string {
  if (vehicles.length === 0) return '—'
  return vehicles
    .map((vehicle) =>
      [
        VEHICLE_TYPE_LABEL[vehicle.type as VehicleTypeEnum] ?? vehicle.type,
        vehicle.plate,
        optionLabel(COLOR_OPTIONS, vehicle.color),
        vehicle.brandModel,
      ]
        .filter(Boolean)
        .join(' · '),
    )
    .join('\n')
}

type AuthorizationItem = {
  authorizedName: string
  personType: string
  document: string
  phone: string | null
  company: string | null
  unit: string
  authorizedBy: string
  validFromDate: string
  validFromTime: string
  validToDate: string
  validToTime: string
  observations: string | null
  createdByUserName: string | null
  createdAt: string
}

type EventItem = {
  title: string
  date: string
  startTime: string | null
  endTime: string | null
  unit: string | null
  space: string | null
  responsibleName: string | null
  observations: string | null
  guestsTotal: number
  guestsAdHoc: number
  guestsCheckedIn: number
  guestsCheckedOut: number
  vehiclesTotal: number
  guests: EventGuestItem[]
  vehicles: EventVehicleItem[]
  createdByUserName: string | null
  createdAt: string
}

type EventGuestItem = {
  name: string
  document: string | null
  isAdHoc: boolean
  checkInAt: string | null
  checkedInByUserName: string | null
  entryVehicle: EventGuestVehicle | null
  checkOutAt: string | null
  checkedOutByUserName: string | null
  exitVehicle: EventGuestVehicle | null
}

type EventGuestVehicle = {
  movementType: EventVehicleMovementType
  plate: string | null
  brandModel: string | null
  color: string | null
  driverName: string | null
  driverDocument: string | null
}

type EventVehicleItem = {
  movementType: EventVehicleMovementType
  plate: string | null
  brandModel: string | null
  color: string | null
  driverName: string | null
  driverDocument: string | null
  entryGuestNames: string[]
  exitGuestNames: string[]
  checkInAt: string
  checkedInByUserName: string | null
  checkOutAt: string | null
  checkedOutByUserName: string | null
}

/** Faixa de cabeçalho que agrupa as linhas de um evento nas tabelas de acesso. */
function eventGroupRow(event: EventItem): ReportGroupRow {
  const time = event.startTime
    ? event.endTime
      ? ` · ${event.startTime} às ${event.endTime}`
      : ` · ${event.startTime}`
    : ''
  const parts = [
    `${event.title} — ${formatPlainDate(event.date)}${time}`,
    event.unit && `Unid: ${event.unit}`,
    event.space,
    event.responsibleName && `Responsável: ${event.responsibleName}`,
  ]
  return { group: parts.filter(Boolean).join(' · ') }
}

/** Horário de entrada/saída e quem registrou. */
function formatEventMovement(at: string | null, byUserName: string | null): string {
  if (!at) return '—'
  return joinLines([formatDateTime(at), byUserName && `Por: ${byUserName}`])
}

/** Tipo de acesso do convidado (a pé, veículo de convidado, desembarque, busca) e dados do veículo. */
function formatGuestAccess(at: string | null, vehicle: EventGuestVehicle | null): string {
  if (!at) return '—'
  if (!vehicle) return 'A pé'
  const colorLabel = optionLabel(COLOR_OPTIONS, vehicle.color)
  return joinLines([
    MOVEMENT_LABEL[vehicle.movementType] ?? vehicle.movementType,
    [vehicle.plate, vehicle.brandModel, colorLabel].filter(Boolean).join(' · '),
    vehicle.driverName &&
      `Motorista: ${vehicle.driverName}${vehicle.driverDocument ? ` (${vehicle.driverDocument})` : ''}`,
  ])
}

function getGuestStatus(guest: EventGuestItem): string {
  if (!guest.checkInAt) return 'Não entrou'
  return guest.checkOutAt ? 'Saiu' : 'No local'
}

/** Placa, marca/modelo e cor do veículo cadastrado, uma informação por linha. */
function formatVehicleLines(
  plate: string | null,
  brandModel: string | null,
  color: string | null,
): string {
  const colorLabel = optionLabel(COLOR_OPTIONS, color)
  return joinLines([plate, brandModel, colorLabel && `Cor: ${colorLabel}`])
}

/** Situação da autorização no momento da exportação: agendada, vigente ou vencida. */
function getAuthorizationStatus(item: AuthorizationItem): string {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  const current = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
  if (current < `${item.validFromDate} ${item.validFromTime}`) return 'Agendada'
  if (current > `${item.validToDate} ${item.validToTime}`) return 'Vencida'
  return 'Vigente'
}

function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return '—'
  const d = new Date(isoDate)
  return d.toLocaleDateString('pt-BR')
}

/**
 * Formata uma data pura 'YYYY-MM-DD' (sem componente de horário) para 'DD/MM/AAAA'
 * sem passar por `Date`, evitando o deslocamento de fuso horário que `new Date('YYYY-MM-DD')`
 * introduz (é interpretada como UTC e pode exibir o dia anterior em fusos negativos como o do Brasil).
 */
function formatPlainDate(plainDate: string | null | undefined): string {
  if (!plainDate) return '—'
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(plainDate)
  if (!match) return plainDate
  const [, year, month, day] = match
  return `${day}/${month}/${year}`
}

function formatDateTime(isoDate: string | null | undefined): string {
  if (!isoDate) return '—'
  const d = new Date(isoDate)
  return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
}

/** Converte o valor salvo (ex.: 'a_pe') no rótulo exibido nos formulários (ex.: 'A pe'). */
function optionLabel(
  options: ReadonlyArray<{ label: string; value: string }>,
  value: string | null | undefined,
): string | null {
  if (!value) return null
  return options.find((option) => option.value === value)?.label ?? value
}

/** Junta as partes preenchidas em linhas, ignorando vazias; '—' se nada sobrar. */
function joinLines(parts: Array<string | null | undefined | false>): string {
  const filled = parts.filter((part): part is string => Boolean(part))
  return filled.length > 0 ? filled.join('\n') : '—'
}

function formatAccessPerson(person: AccessPerson, record: AccessItem): string {
  const category = optionLabel(ACCESS_PERSON_TYPE_OPTIONS, person.category)
  const details = [
    category,
    person.document ? `Doc: ${person.document}` : null,
    person.unit ? `Unid: ${person.unit}` : null,
  ]
    .filter(Boolean)
    .join(' · ')
  // Saída individual só é relevante quando difere da saída do registro (saída parcial).
  const leftSeparately = person.checkOutAt !== null && person.checkOutAt !== record.checkOutAt

  return joinLines([
    person.name,
    details,
    leftSeparately &&
      `Saída: ${formatDateTime(person.checkOutAt)}${person.checkedOutByUserName ? ` (${person.checkedOutByUserName})` : ''}`,
    person.checkOutObservations && `Obs. saída: ${person.checkOutObservations}`,
  ])
}

/** Quem cadastrou o registro e quando ("Usuário removido" se o usuário foi excluído). */
function formatCreatedBy(item: { createdByUserName: string | null; createdAt: string }): string {
  return joinLines([item.createdByUserName ?? 'Usuário removido', formatDate(item.createdAt)])
}

export type ReportModuleDef = {
  key: ReportModuleKey
  label: string
  descricao: string
  /** Rótulo curto exibido no card do grid de relatórios (título do export é mais descritivo). */
  cardLabel: string
  /** Descrição curta exibida no card do grid de relatórios. */
  cardDescricao: string
  icon: SvgIconComponent
  color: string
  route: string
  bffPath: string
  columns: string[]
  /** Larguras/estilos opcionais por coluna no PDF (índice da coluna → estilo do jspdf-autotable). */
  columnStyles?: UserOptions['columnStyles']
  mapRow: (item: unknown) => string[]
  /** Tabelas extras exportadas no mesmo PDF, com várias linhas geradas por item (ex.: convidados de cada evento). */
  detailSections?: ReportDetailSection[]
}

/** Linha de cabeçalho de grupo: ocupa a largura toda da tabela (ex.: dados do evento). */
export type ReportGroupRow = { group: string }

export type ReportRow = string[] | ReportGroupRow

export type ReportDetailSection = {
  title: string
  columns: string[]
  columnStyles?: UserOptions['columnStyles']
  mapRows: (item: unknown) => ReportRow[]
}

export const REPORT_MODULES: Record<ReportModuleKey, ReportModuleDef> = {
  acessos: {
    key: 'acessos',
    label: 'Registro de acessos',
    descricao: 'Histórico completo de entradas e saídas pela portaria.',
    cardLabel: 'Acessos',
    cardDescricao: 'Entradas e saídas registradas',
    icon: AccessTimeIcon,
    color: 'success.main',
    route: '/acessos',
    bffPath: '/api/reports/accesses',
    columns: ['Entrada', 'Saída', 'Pessoas', 'Empresa', 'Veículo', 'Observações'],
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 32 },
      2: { cellWidth: 80 },
      3: { cellWidth: 30 },
      4: { cellWidth: 40 },
    },
    mapRow: (raw) => {
      const item = raw as AccessItem
      return [
        joinLines([
          formatDateTime(item.checkInAt),
          item.checkedInByUserName && `Por: ${item.checkedInByUserName}`,
        ]),
        item.checkOutAt
          ? joinLines([
              formatDateTime(item.checkOutAt),
              item.checkedOutByUserName && `Por: ${item.checkedOutByUserName}`,
            ])
          : 'Em aberto',
        item.people.map((person) => formatAccessPerson(person, item)).join('\n\n') || '—',
        item.company ?? '—',
        joinLines([
          optionLabel(LOCOMOTION_OPTIONS, item.locomotion),
          item.plate && `Placa: ${item.plate}`,
          optionLabel(COLOR_OPTIONS, item.color) &&
            `Cor: ${optionLabel(COLOR_OPTIONS, item.color)}`,
          item.brandModel,
        ]),
        joinLines([
          item.observations && `Entrada: ${item.observations}`,
          item.checkOutObservations && `Saída: ${item.checkOutObservations}`,
        ]),
      ]
    },
  },
  moradores: {
    key: 'moradores',
    label: 'Registro de moradores',
    descricao: 'Cadastro completo dos moradores do condomínio.',
    cardLabel: 'Moradores',
    cardDescricao: 'Cadastro de residentes',
    icon: HomeIcon,
    color: 'primary.main',
    route: '/moradores',
    bffPath: '/api/reports/residents',
    columns: [
      'Nome',
      'Unidade',
      'Vínculo',
      'CPF/RG',
      'Telefone',
      'E-mail',
      'Veículos',
      'Observações',
      'Cadastrado por',
    ],
    columnStyles: {
      0: { cellWidth: 34 },
      1: { cellWidth: 15 },
      2: { cellWidth: 22 },
      3: { cellWidth: 26 },
      4: { cellWidth: 26 },
      5: { cellWidth: 40 },
      6: { cellWidth: 56 },
      8: { cellWidth: 26 },
    },
    mapRow: (raw) => {
      const item = raw as ResidentItem
      return [
        item.fullName,
        (item.units ?? []).join(', ') || '—',
        RESIDENT_RELATION_LABEL[item.relation as ResidentRelationEnum] ?? item.relation,
        item.document ?? '—',
        item.phone ?? '—',
        item.email ?? '—',
        formatResidentVehicles(item.vehicles ?? []),
        item.observations ?? '—',
        formatCreatedBy(item),
      ]
    },
  },
  visitantes: {
    key: 'visitantes',
    label: 'Registro de visitantes',
    descricao: 'Cadastro de visitantes registrados no sistema.',
    cardLabel: 'Visitantes',
    cardDescricao: 'Visitas cadastradas',
    icon: PeopleIcon,
    color: 'info.main',
    route: '/visitantes',
    bffPath: '/api/reports/visitors',
    columns: [
      'Nome',
      'CPF',
      'Unidade',
      'Autorizado por',
      'Telefone',
      'E-mail',
      'Veículo',
      'Observações',
      'Cadastrado por',
    ],
    columnStyles: {
      0: { cellWidth: 34 },
      1: { cellWidth: 26 },
      2: { cellWidth: 16 },
      3: { cellWidth: 30 },
      4: { cellWidth: 26 },
      5: { cellWidth: 40 },
      6: { cellWidth: 40 },
      8: { cellWidth: 26 },
    },
    mapRow: (raw) => {
      const item = raw as VisitorItem
      return [
        item.fullName,
        item.document,
        item.unit,
        item.authorizedBy,
        item.phone ?? '—',
        item.email ?? '—',
        joinLines([
          item.vehiclePlate,
          item.vehicleBrandModel,
          optionLabel(COLOR_OPTIONS, item.vehicleColor) &&
            `Cor: ${optionLabel(COLOR_OPTIONS, item.vehicleColor)}`,
        ]),
        item.observations ?? '—',
        formatCreatedBy(item),
      ]
    },
  },
  prestadores: {
    key: 'prestadores',
    label: 'Registro de prestadores de serviço',
    descricao: 'Cadastro de prestadores de serviço e empresas terceirizadas.',
    cardLabel: 'Prestadores de Serviços',
    cardDescricao: 'Empresas e profissionais',
    icon: BusinessCenterIcon,
    color: 'warning.main',
    route: '/prestadores-servicos',
    bffPath: '/api/reports/service-providers',
    columns: [
      'Empresa',
      'Prestador',
      'CPF',
      'Serviço',
      'Unidade',
      'Autorizado por',
      'Telefone',
      'E-mail',
      'Veículo',
      'Observações',
      'Cadastrado por',
    ],
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: 26 },
      2: { cellWidth: 24 },
      3: { cellWidth: 20 },
      4: { cellWidth: 14 },
      5: { cellWidth: 24 },
      6: { cellWidth: 26 },
      7: { cellWidth: 34 },
      8: { cellWidth: 24 },
      10: { cellWidth: 26 },
    },
    mapRow: (raw) => {
      const item = raw as ServiceProviderItem
      return [
        item.companyName,
        item.responsibleName,
        item.document,
        item.serviceType,
        item.unit ?? '—',
        item.authorizedBy,
        item.phone ?? '—',
        item.email ?? '—',
        formatVehicleLines(item.vehiclePlate, item.vehicleBrandModel, item.vehicleColor),
        item.observations ?? '—',
        formatCreatedBy(item),
      ]
    },
  },
  eventos: {
    key: 'eventos',
    label: 'Registro de eventos',
    descricao: 'Eventos e reservas de espaços cadastrados no condomínio.',
    cardLabel: 'Eventos',
    cardDescricao: 'Reservas e confraternizações',
    icon: EventIcon,
    color: 'secondary.main',
    route: '/eventos',
    bffPath: '/api/reports/events',
    columns: [
      'Título',
      'Data',
      'Horário',
      'Unidade',
      'Espaço',
      'Responsável',
      'Convidados',
      'Veículos',
      'Observações',
      'Cadastrado por',
    ],
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 20 },
      2: { cellWidth: 20 },
      3: { cellWidth: 16 },
      4: { cellWidth: 28 },
      5: { cellWidth: 34 },
      6: { cellWidth: 34 },
      7: { cellWidth: 18 },
      9: { cellWidth: 26 },
    },
    mapRow: (raw) => {
      const item = raw as EventItem
      const stillInside = item.guestsCheckedIn - item.guestsCheckedOut
      return [
        item.title,
        formatPlainDate(item.date),
        item.startTime
          ? item.endTime
            ? `${item.startTime} às ${item.endTime}`
            : item.startTime
          : '—',
        item.unit ?? '—',
        item.space ?? '—',
        item.responsibleName ?? '—',
        joinLines([
          `Total: ${item.guestsTotal}`,
          item.guestsAdHoc > 0 && `Avulsos: ${item.guestsAdHoc}`,
          `Entraram: ${item.guestsCheckedIn}`,
          `Saíram: ${item.guestsCheckedOut}`,
          stillInside > 0 && `No local: ${stillInside}`,
        ]),
        String(item.vehiclesTotal),
        item.observations ?? '—',
        formatCreatedBy(item),
      ]
    },
    detailSections: [
      {
        title: 'Acessos de convidados em eventos',
        columns: [
          'Convidado',
          'Entrada',
          'Acesso na entrada',
          'Saída',
          'Acesso na saída',
          'Situação',
        ],
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 36 },
          2: { cellWidth: 60 },
          3: { cellWidth: 36 },
          4: { cellWidth: 60 },
        },
        mapRows: (raw) => {
          const event = raw as EventItem
          const guests = event.guests ?? []
          if (guests.length === 0) return []
          return [
            eventGroupRow(event),
            ...guests.map((guest) => [
              joinLines([
                guest.name,
                guest.document && `Doc: ${guest.document}`,
                guest.isAdHoc && 'Convidado avulso (fora da lista)',
              ]),
              formatEventMovement(guest.checkInAt, guest.checkedInByUserName),
              formatGuestAccess(guest.checkInAt, guest.entryVehicle),
              formatEventMovement(guest.checkOutAt, guest.checkedOutByUserName),
              formatGuestAccess(guest.checkOutAt, guest.exitVehicle),
              getGuestStatus(guest),
            ]),
          ]
        },
      },
      {
        title: 'Acessos de veículos em eventos',
        columns: ['Tipo', 'Veículo', 'Motorista', 'Passageiros', 'Entrada', 'Saída'],
        columnStyles: {
          0: { cellWidth: 32 },
          1: { cellWidth: 42 },
          2: { cellWidth: 45 },
          4: { cellWidth: 40 },
          5: { cellWidth: 40 },
        },
        mapRows: (raw) => {
          const event = raw as EventItem
          const vehicles = event.vehicles ?? []
          if (vehicles.length === 0) return []
          return [
            eventGroupRow(event),
            ...vehicles.map((vehicle) => [
              MOVEMENT_LABEL[vehicle.movementType] ?? vehicle.movementType,
              formatVehicleLines(vehicle.plate, vehicle.brandModel, vehicle.color),
              joinLines([
                vehicle.driverName,
                vehicle.driverDocument && `Doc: ${vehicle.driverDocument}`,
              ]),
              joinLines([
                vehicle.entryGuestNames.length > 0 &&
                  `Entrada: ${vehicle.entryGuestNames.join(', ')}`,
                vehicle.exitGuestNames.length > 0 && `Saída: ${vehicle.exitGuestNames.join(', ')}`,
              ]),
              formatEventMovement(vehicle.checkInAt, vehicle.checkedInByUserName),
              vehicle.checkOutAt
                ? formatEventMovement(vehicle.checkOutAt, vehicle.checkedOutByUserName)
                : 'Em aberto',
            ]),
          ]
        },
      },
    ],
  },
  ocorrencias: {
    key: 'ocorrencias',
    label: 'Registro de ocorrências',
    descricao: 'Ocorrências e incidentes registrados na portaria.',
    cardLabel: 'Ocorrências',
    cardDescricao: 'Registros de incidentes',
    icon: ReportProblemIcon,
    color: 'error.main',
    route: '/ocorrencias',
    bffPath: '/api/reports/incidents',
    columns: ['Data', 'Hora', 'Tipo', 'Local', 'Relato', 'Cadastrado por'],
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 14 },
      2: { cellWidth: 45 },
      3: { cellWidth: 35 },
      5: { cellWidth: 26 },
    },
    mapRow: (raw) => {
      const item = raw as IncidentItem
      return [
        formatPlainDate(item.date),
        item.time,
        OCCURRENCE_TYPE_LABEL[item.occurrenceType as OccurrenceTypeEnum] ?? item.occurrenceType,
        item.place ?? '—',
        item.report,
        formatCreatedBy(item),
      ]
    },
  },
  autorizacoes: {
    key: 'autorizacoes',
    label: 'Registro de autorizações',
    descricao: 'Autorizações de entrada emitidas para visitantes e prestadores.',
    cardLabel: 'Autorizações',
    cardDescricao: 'Liberações de acesso vigentes',
    icon: AssignmentIndIcon,
    color: 'secondary.main',
    route: '/autorizacoes',
    bffPath: '/api/reports/authorizations',
    columns: [
      'Nome',
      'Tipo',
      'CPF',
      'Telefone',
      'Empresa',
      'Unidade',
      'Autorizado por',
      'Válido de',
      'Válido até',
      'Situação',
      'Observações',
      'Cadastrado por',
    ],
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 20 },
      2: { cellWidth: 24 },
      3: { cellWidth: 24 },
      4: { cellWidth: 22 },
      5: { cellWidth: 14 },
      6: { cellWidth: 26 },
      7: { cellWidth: 20 },
      8: { cellWidth: 20 },
      9: { cellWidth: 16 },
      11: { cellWidth: 26 },
    },
    mapRow: (raw) => {
      const item = raw as AuthorizationItem
      return [
        item.authorizedName,
        PERSON_TYPE_LABEL[item.personType as keyof typeof PERSON_TYPE_LABEL] ?? item.personType,
        item.document,
        item.phone ?? '—',
        item.company ?? '—',
        item.unit,
        item.authorizedBy,
        `${formatPlainDate(item.validFromDate)} ${item.validFromTime}`,
        `${formatPlainDate(item.validToDate)} ${item.validToTime}`,
        getAuthorizationStatus(item),
        item.observations ?? '—',
        formatCreatedBy(item),
      ]
    },
  },
}
