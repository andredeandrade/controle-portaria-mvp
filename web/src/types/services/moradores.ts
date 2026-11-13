import type { Resident, ResidentsListResponse } from '@/app/api/residents/types'

export type ListResidentsApiResponseBody =
  | ({ message?: string } & Partial<ResidentsListResponse>)
  | null

export type RegisterResidentApiResponseBody = ({ message?: string } & Partial<Resident>) | null

export type GetResidentApiResponseBody = ({ message?: string } & Partial<Resident>) | null

export type UpdateResidentApiResponseBody = ({ message?: string } & Partial<Resident>) | null
