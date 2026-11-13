export type ServiceProviderRecord = {
  id: string
  companyName: string
  responsibleName: string
  document: string
  serviceType: string
  phone: string
  unit?: string
  authorizedBy?: string
  email?: string
  observations?: string
  vehiclePlate?: string
  vehicleBrandModel?: string
  vehicleColor?: string
}

export type ServiceProvidersPaginationState = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}
