export interface AccessRecordPersonInput {
  category: string
  name: string
  document?: string
  unit?: string
}

export interface CheckInAccessRecordInput {
  condominiumId: string
  people: AccessRecordPersonInput[]
  company?: string
  locomotion?: string
  color?: string
  plate?: string
  brandModel?: string
  observations?: string
  checkedInByUserId: string
}

export interface CheckOutAccessRecordInput {
  observations?: string | null
  personIds?: string[]
  checkedOutByUserId: string
}

export type AccessRecordListStatus = 'all' | 'open' | 'closed'

export interface ListAccessRecordsInput {
  condominiumId: string
  page: number
  pageSize: number
  search?: string
  status?: AccessRecordListStatus
}

export interface AccessRecordPersonResponse {
  id: string
  category: string
  name: string
  unit: string | null
  document: string | null
  checkOutAt: Date | null
  checkedOutByUserId: string | null
  checkOutObservations: string | null
  isOpen: boolean
}

export interface AccessRecordResponse {
  id: string
  people: AccessRecordPersonResponse[]
  company: string | null
  locomotion: string | null
  color: string | null
  plate: string | null
  brandModel: string | null
  observations: string | null
  checkOutObservations: string | null
  checkInAt: Date
  checkOutAt: Date | null
  checkedInByUserId: string | null
  checkedOutByUserId: string | null
  createdAt: Date
  updatedAt: Date
  isOpen: boolean
}
