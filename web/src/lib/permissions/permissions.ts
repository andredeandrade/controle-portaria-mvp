import { UserRole } from '@/app/api/auth/me/types'

export type DomainAction = 'create' | 'view' | 'update' | 'remove'
export type EventAction = DomainAction | 'addGuest' | 'registerAccess'
export type AccessRecordAction = 'checkIn' | 'checkOut' | 'view'
export type ReportAction = 'view'

export type ResourceActionMap = {
  residents: DomainAction
  visitors: DomainAction
  'service-providers': DomainAction
  authorizations: DomainAction
  events: EventAction
  incidents: DomainAction
  'access-records': AccessRecordAction
  reports: ReportAction
}

const ALL_DOMAIN_ACTIONS: DomainAction[] = ['create', 'view', 'update', 'remove']
const ALL_EVENT_ACTIONS: EventAction[] = [
  'create',
  'view',
  'update',
  'remove',
  'addGuest',
  'registerAccess',
]
const ALL_ACCESS_RECORD_ACTIONS: AccessRecordAction[] = ['checkIn', 'checkOut', 'view']
const ALL_REPORT_ACTIONS: ReportAction[] = ['view']

type PermissionMatrix = {
  [Role in UserRole]: {
    [Resource in keyof ResourceActionMap]: ResourceActionMap[Resource][]
  }
}

const FULL_ACCESS_RESOURCES = {
  residents: ALL_DOMAIN_ACTIONS,
  visitors: ALL_DOMAIN_ACTIONS,
  'service-providers': ALL_DOMAIN_ACTIONS,
  authorizations: ALL_DOMAIN_ACTIONS,
  events: ALL_EVENT_ACTIONS,
  incidents: ALL_DOMAIN_ACTIONS,
  'access-records': ALL_ACCESS_RECORD_ACTIONS,
  reports: ALL_REPORT_ACTIONS,
} as const

const PERMISSION_MATRIX: PermissionMatrix = {
  [UserRole.ADMIN]: FULL_ACCESS_RESOURCES,
  [UserRole.GESTOR]: FULL_ACCESS_RESOURCES,
  [UserRole.SINDICO]: {
    ...FULL_ACCESS_RESOURCES,
    'access-records': ['view'],
  },
  [UserRole.SEGURANCA]: {
    residents: ['view'],
    visitors: ['view'],
    'service-providers': ['view'],
    authorizations: ['view'],
    events: ['view', 'addGuest', 'registerAccess'],
    incidents: ['view', 'create'],
    'access-records': ['checkIn', 'checkOut', 'view'],
    reports: [],
  },
}

/**
 * Verifica se um determinado role possui permissão para executar uma ação
 * sobre um recurso. Espelha a matriz de permissões implementada no backend.
 */
export function hasPermission<Resource extends keyof ResourceActionMap>(
  role: UserRole | undefined,
  resource: Resource,
  action: ResourceActionMap[Resource],
): boolean {
  if (!role) {
    return false
  }

  const allowedActions = PERMISSION_MATRIX[role][resource]

  return (allowedActions as ResourceActionMap[Resource][]).includes(action)
}
