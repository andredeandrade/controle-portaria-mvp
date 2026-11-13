export type Visitor = {
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
  createdAt: string
  updatedAt: string
}

export type VisitorsListResponse = {
  items: Visitor[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export type CreateVisitorRequest = {
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
}
