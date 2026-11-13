export type ServiceProvider = {
  id: string
  companyName: string
  responsibleName: string
  document: string
  phone: string | null
  email: string | null
  serviceType: string
  unit: string | null
  authorizedBy: string
  observations: string | null
  vehiclePlate: string | null
  vehicleBrandModel: string | null
  vehicleColor: string | null
  createdByUserId: string | null
  createdAt: string
  updatedAt: string
}

export type ServiceProvidersListResponse = {
  items: ServiceProvider[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export type CreateServiceProviderRequest = {
  companyName: string
  responsibleName: string
  document: string
  phone?: string
  email?: string
  serviceType: string
  unit?: string
  authorizedBy: string
  observations?: string
  vehiclePlate?: string
  vehicleBrandModel?: string
  vehicleColor?: string
}
