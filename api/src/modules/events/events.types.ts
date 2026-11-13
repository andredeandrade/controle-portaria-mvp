export type EventVehicleMovementType = 'CONVIDADO' | 'DESEMBARQUE' | 'BUSCA'

export interface EventGuestInput {
  id?: string
  name: string
  document?: string
}

export interface CreateEventInput {
  condominiumId: string
  title: string
  date: string
  startTime: string
  endTime?: string
  unit: string
  space?: string
  responsibleName: string
  guests: EventGuestInput[]
  observations?: string
  createdByUserId: string
}

export interface UpdateEventInput {
  title?: string
  date?: string
  startTime?: string
  endTime?: string | null
  unit?: string
  space?: string | null
  responsibleName?: string
  guests?: EventGuestInput[]
  observations?: string | null
}

export interface ListEventsInput {
  condominiumId: string
  page: number
  pageSize: number
  search?: string
}

export interface EventGuestVehicleRefResponse {
  id: string
  plate: string | null
  brandModel: string | null
}

export interface EventGuestResponse {
  id: string
  name: string
  document: string | null
  isAdHoc: boolean
  entryVehicle: EventGuestVehicleRefResponse | null
  exitVehicle: EventGuestVehicleRefResponse | null
  checkInAt: Date | null
  checkOutAt: Date | null
}

export interface EventVehicleOccupantResponse {
  id: string
  name: string
  via: 'entry' | 'exit'
}

export interface EventVehicleResponse {
  id: string
  plate: string | null
  brandModel: string | null
  driverName: string | null
  driverDocument: string | null
  color: string | null
  movementType: EventVehicleMovementType
  isOpen: boolean
  occupants: EventVehicleOccupantResponse[]
  checkInAt: Date
  checkOutAt: Date | null
}

export interface CreateEventVehicleInput {
  plate: string
  brandModel?: string
  driverName?: string
  driverDocument?: string
  color?: string
}

export interface CreateEventGuestInput {
  name: string
  document?: string
}

export interface CheckInEventGuestInput {
  document?: string
  vehicle?: {
    plate?: string
    brandModel?: string
    color?: string
  }
}

export interface CheckOutEventVehicleInput {
  guestIds?: string[]
}

export interface RegisterEventAccessVehicleInput {
  driverName?: string
  driverDocument?: string
  plate?: string
  brandModel?: string
  color?: string
}

export interface RegisterEventAccessGuestInput {
  guestId: string
  document?: string
}

export interface RegisterEventAccessNewGuestInput {
  name: string
  document?: string
}

export interface RegisterEventAccessInput {
  movementType: EventVehicleMovementType
  vehicle?: RegisterEventAccessVehicleInput
  guests: RegisterEventAccessGuestInput[]
  newGuests?: RegisterEventAccessNewGuestInput[]
}

export interface EventResponse {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string | null
  unit: string
  space: string | null
  responsibleName: string
  guests: EventGuestResponse[]
  vehicles: EventVehicleResponse[]
  observations: string | null
  createdByUserId: string | null
  createdAt: Date
  updatedAt: Date
}
