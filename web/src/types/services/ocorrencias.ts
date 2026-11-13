import type { Incident, IncidentsListResponse } from '@/app/api/incidents/types'

export type ListIncidentsApiResponseBody =
  | ({ message?: string } & Partial<IncidentsListResponse>)
  | null

export type RegisterIncidentApiResponseBody = ({ message?: string } & Partial<Incident>) | null

export type GetIncidentApiResponseBody = ({ message?: string } & Partial<Incident>) | null

export type UpdateIncidentApiResponseBody = ({ message?: string } & Partial<Incident>) | null
