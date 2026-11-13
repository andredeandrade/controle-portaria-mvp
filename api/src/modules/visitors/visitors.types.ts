export interface CreateVisitorInput {
  condominiumId: string
  fullName: string
  document: string
  phone?: string
  email?: string
  unit: string
  authorizedBy: string
  observations?: string
  vehiclePlate?: string
  vehicleBrandModel?: string
  vehicleColor?: string
  createdByUserId: string
}

export interface UpdateVisitorInput {
  fullName?: string
  document?: string
  phone?: string | null
  email?: string | null
  unit?: string
  authorizedBy?: string
  observations?: string | null
}

export interface ListVisitorsInput {
  condominiumId: string
  page: number
  pageSize: number
  search?: string
}

export interface VisitorResponse {
  id: string
  fullName: string
  document: string
  phone: string | null
  email: string | null
  unit: string
  authorizedBy: string
  observations: string | null
  vehiclePlate: string | null
  vehicleBrandModel: string | null
  vehicleColor: string | null
  createdByUserId: string | null
  createdAt: Date
  updatedAt: Date
}
