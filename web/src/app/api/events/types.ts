export type EventGuestVehicleRef = {
  id: string
  plate: string | null
  brandModel: string | null
}

export type EventGuest = {
  id: string
  name: string
  document: string | null
  isAdHoc: boolean
  entryVehicle: EventGuestVehicleRef | null
  exitVehicle: EventGuestVehicleRef | null
  checkInAt: string | null
  checkOutAt: string | null
}

export type EventVehicleMovementType = 'CONVIDADO' | 'DESEMBARQUE' | 'BUSCA'

export type EventVehicleOccupant = {
  id: string
  name: string
  via: 'entry' | 'exit'
}

export type EventVehicle = {
  id: string
  plate: string | null
  brandModel: string | null
  driverName: string | null
  driverDocument: string | null
  color: string | null
  movementType: EventVehicleMovementType
  isOpen: boolean
  occupants: EventVehicleOccupant[]
  checkInAt: string
  checkOutAt: string | null
}

export type Event = {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string | null
  unit: string
  space: string | null
  responsibleName: string
  guests: EventGuest[]
  vehicles: EventVehicle[]
  observations: string | null
  createdByUserId: string | null
  createdAt: string
  updatedAt: string
}

export type EventsListResponse = {
  items: Event[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export type CreateEventRequest = {
  title: string
  date: string
  startTime: string
  endTime?: string
  unit: string
  space?: string
  responsibleName: string
  guests: {
    name: string
    document?: string
  }[]
  observations?: string
}

export type UpdateEventRequest = {
  title?: string
  date?: string
  startTime?: string
  endTime?: string
  unit?: string
  space?: string
  responsibleName?: string
  guests?: {
    id?: string
    name: string
    document?: string
  }[]
  observations?: string
}

export type CreateEventVehicleRequest = {
  plate: string
  brandModel?: string
  driverName?: string
  driverDocument?: string
  color?: string
}

export type CreateEventGuestRequest = {
  name: string
  document?: string
}

export type CheckInEventGuestRequest = {
  document?: string
  vehicle?: {
    plate?: string
    brandModel?: string
    color?: string
  }
}

export type CheckOutEventVehicleRequest = {
  guestIds?: string[]
}

export type RegisterEventAccessVehicleRequest = {
  driverName?: string
  driverDocument?: string
  plate?: string
  brandModel?: string
  color?: string
}

export type RegisterEventAccessGuestRequest = {
  guestId: string
  document?: string
}

export type RegisterEventAccessNewGuestRequest = {
  name: string
  document?: string
}

export type RegisterEventAccessRequest = {
  movementType: EventVehicleMovementType
  vehicle?: RegisterEventAccessVehicleRequest
  guests: RegisterEventAccessGuestRequest[]
  newGuests?: RegisterEventAccessNewGuestRequest[]
}
