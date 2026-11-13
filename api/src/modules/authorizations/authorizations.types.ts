export interface CreateAuthorizationInput {
  condominiumId: string
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
  createdByUserId: string
}

export interface UpdateAuthorizationInput {
  authorizedName?: string
  personType?: string
  document?: string
  phone?: string | null
  company?: string | null
  unit?: string
  authorizedBy?: string
  validFromDate?: string
  validFromTime?: string
  validToDate?: string
  validToTime?: string
  observations?: string | null
}

export interface ListAuthorizationsInput {
  condominiumId: string
  page: number
  pageSize: number
  search?: string
}

export interface AuthorizationResponse {
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
  createdAt: Date
  updatedAt: Date
}
