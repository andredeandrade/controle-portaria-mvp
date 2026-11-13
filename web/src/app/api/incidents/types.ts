export type Incident = {
  id: string
  occurrenceType: string
  date: string
  time: string
  report: string
  place: string | null
  createdByUserId: string | null
  createdByUserName: string | null
  createdAt: string
  updatedAt: string
}

export type IncidentsListResponse = {
  items: Incident[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export type CreateIncidentRequest = {
  occurrenceType: string
  date: string
  time: string
  report: string
  place: string
}
