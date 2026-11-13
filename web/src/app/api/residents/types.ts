export type ResidentRelation = 'proprietario' | 'inquilino' | 'dependente'

export type VehicleType = 'carro' | 'moto' | 'outro'

export type ResidentVehicle = {
  id: string
  type: VehicleType
  color: string | null
  plate: string | null
  brandModel: string | null
}

export type Resident = {
  id: string
  fullName: string
  units: string[]
  relation: ResidentRelation
  email: string | null
  phone: string | null
  document: string | null
  observations: string | null
  vehicles: ResidentVehicle[]
  createdByUserId: string | null
  createdAt: string
  updatedAt: string
}

export type ResidentsListResponse = {
  items: Resident[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export type CreateResidentRequest = {
  fullName: string
  units: string[]
  relation: ResidentRelation
  email?: string
  phone?: string
  document: string
  observations?: string
  vehicles?: {
    type?: VehicleType | ''
    color?: string
    plate?: string
    brandModel?: string
  }[]
}
