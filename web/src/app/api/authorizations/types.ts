export type Authorization = {
  id: string
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
  createdByUserId: string | null
  createdAt: string
  updatedAt: string
}

export type AuthorizationsListResponse = {
  items: Authorization[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export type CreateAuthorizationRequest = {
  authorizedName: string
  personType: string
  document: string
  phone?: string
  company?: string
  unit: string
  authorizedBy: string
  validFromDate: string
  validFromTime: string
  validToDate: string
  validToTime: string
  observations?: string
}
