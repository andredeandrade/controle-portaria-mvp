import type { UserRole } from './jwt.js'

export type DomainAction = 'create' | 'view' | 'update' | 'remove'
export type AccessRecordAction = 'checkIn' | 'checkOut' | 'view'
export type ReportAction = 'view'
export type EventAction = DomainAction | 'addGuest' | 'registerAccess'

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

const DOMAIN_ACTIONS_FULL: DomainAction[] = ['create', 'view', 'update', 'remove']
const DOMAIN_ACTIONS_VIEW_ONLY: DomainAction[] = ['view']

type PermissionsByResource = { [Resource in keyof ResourceActionMap]: ResourceActionMap[Resource][] }

const permissionMatrix: Record<UserRole, PermissionsByResource> = {
  ADMIN: {
    residents: DOMAIN_ACTIONS_FULL,
    visitors: DOMAIN_ACTIONS_FULL,
    'service-providers': DOMAIN_ACTIONS_FULL,
    authorizations: DOMAIN_ACTIONS_FULL,
    events: [...DOMAIN_ACTIONS_FULL, 'addGuest', 'registerAccess'],
    incidents: DOMAIN_ACTIONS_FULL,
    'access-records': ['checkIn', 'checkOut', 'view'],
    reports: ['view'],
  },
  GESTOR: {
    residents: DOMAIN_ACTIONS_FULL,
    visitors: DOMAIN_ACTIONS_FULL,
    'service-providers': DOMAIN_ACTIONS_FULL,
    authorizations: DOMAIN_ACTIONS_FULL,
    events: [...DOMAIN_ACTIONS_FULL, 'addGuest', 'registerAccess'],
    incidents: DOMAIN_ACTIONS_FULL,
    'access-records': ['checkIn', 'checkOut', 'view'],
    reports: ['view'],
  },
  SINDICO: {
    residents: DOMAIN_ACTIONS_FULL,
    visitors: DOMAIN_ACTIONS_FULL,
    'service-providers': DOMAIN_ACTIONS_FULL,
    authorizations: DOMAIN_ACTIONS_FULL,
    events: [...DOMAIN_ACTIONS_FULL, 'addGuest', 'registerAccess'],
    incidents: DOMAIN_ACTIONS_FULL,
    'access-records': ['view'],
    reports: ['view'],
  },
  SEGURANCA: {
    residents: DOMAIN_ACTIONS_VIEW_ONLY,
    visitors: DOMAIN_ACTIONS_VIEW_ONLY,
    'service-providers': DOMAIN_ACTIONS_VIEW_ONLY,
    authorizations: DOMAIN_ACTIONS_VIEW_ONLY,
    events: ['view', 'addGuest', 'registerAccess'],
    incidents: ['view', 'create'],
    'access-records': ['checkIn', 'checkOut', 'view'],
    reports: [],
  },
}

export function hasPermission<Resource extends keyof ResourceActionMap>(
  role: UserRole,
  resource: Resource,
  action: ResourceActionMap[Resource],
): boolean {
  const resourcePermissions = permissionMatrix[role][resource] as ResourceActionMap[Resource][]

  return resourcePermissions.includes(action)
}
