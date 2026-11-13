export type VisitorRecord = {
  id: string
  name: string
  document: string
  unit: string
  authorizedBy: string
  phone: string
  observations?: string
  vehiclePlate?: string
  vehicleBrandModel?: string
  vehicleColor?: string
}

export type VisitorsPaginationState = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}
