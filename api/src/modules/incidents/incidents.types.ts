export interface CreateIncidentInput {
  condominiumId: string
  occurrenceType: string
  date: string
  time: string
  report: string
  place: string
  createdByUserId: string
}

export interface UpdateIncidentInput {
  occurrenceType?: string
  date?: string
  time?: string
  report?: string | null
  place?: string
}

export interface ListIncidentsInput {
  condominiumId: string
  page: number
  pageSize: number
  search?: string
}

export interface IncidentResponse {
  id: string
  occurrenceType: string
  date: string
  time: string
  report: string
  place: string | null
  createdByUserId: string | null
  createdByUserName: string | null
  createdAt: Date
  updatedAt: Date
}
