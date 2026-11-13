export type ResidentRelation = 'proprietario' | 'inquilino' | 'dependente'

export type VehicleType = 'carro' | 'moto' | 'outro'

export interface VehicleInput {
  type?: VehicleType | ''
  color?: string
  plate?: string
  brandModel?: string
}

export interface ResidentVehicleResponse {
  id: string
  type: VehicleType
  color: string | null
  plate: string | null
  brandModel: string | null
}

export interface CreateResidentInput {
  condominiumId: string
  fullName: string
  units: string[]
  relation: ResidentRelation
  email?: string
  phone?: string
  document: string
  observations?: string
  vehicles?: VehicleInput[]
  createdByUserId: string
}

export interface UpdateResidentInput {
  fullName?: string
  units?: string[]
  relation?: ResidentRelation
  email?: string | null
  phone?: string | null
  document?: string | null
  observations?: string | null
  vehicles?: VehicleInput[]
}

export interface ListResidentsInput {
  condominiumId: string
  page: number
  pageSize: number
  search?: string
}

export interface ResidentResponse {
  id: string
  fullName: string
  units: string[]
  relation: ResidentRelation
  email: string | null
  phone: string | null
  document: string | null
  observations: string | null
  vehicles: ResidentVehicleResponse[]
  createdByUserId: string | null
  createdAt: Date
  updatedAt: Date
}
