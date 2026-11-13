export type AccessRecordPerson = {
  id: string
  category: string
  name: string
  document: string | null
  unit: string | null
  checkOutAt: string | null
  checkedOutByUserId: string | null
  checkOutObservations: string | null
  isOpen: boolean
}

export type AccessRecord = {
  id: string
  people: AccessRecordPerson[]
  company: string | null
  locomotion: string | null
  color: string | null
  plate: string | null
  brandModel: string | null
  observations: string | null
  checkOutObservations: string | null
  checkInAt: string
  checkOutAt: string | null
  checkedInByUserId: string | null
  checkedOutByUserId: string | null
  createdAt: string
  updatedAt: string
  isOpen: boolean
}

export type AccessRecordsListResponse = {
  items: AccessRecord[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export type CreateAccessRecordRequest = {
  people: Array<{
    category: string
    name: string
    document?: string
    unit?: string
  }>
  company?: string
  locomotion?: string
  color?: string
  plate?: string
  brandModel?: string
  observations?: string
}

export type CheckOutAccessRecordRequest = {
  id: string
  observations?: string
  personIds?: string[]
}
