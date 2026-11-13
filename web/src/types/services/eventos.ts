import type { Event, EventsListResponse } from '@/app/api/events/types'

export type ListEventsApiResponseBody = ({ message?: string } & Partial<EventsListResponse>) | null

export type RegisterEventApiResponseBody = ({ message?: string } & Partial<Event>) | null

export type GetEventApiResponseBody = ({ message?: string } & Partial<Event>) | null

export type UpdateEventApiResponseBody = ({ message?: string } & Partial<Event>) | null

export type CheckInEventGuestApiResponseBody = ({ message?: string } & Partial<Event>) | null

export type CheckOutEventGuestApiResponseBody = ({ message?: string } & Partial<Event>) | null

export type CreateEventVehicleApiResponseBody = ({ message?: string } & Partial<Event>) | null

export type CreateEventGuestApiResponseBody = ({ message?: string } & Partial<Event>) | null

export type CheckOutEventVehicleApiResponseBody = ({ message?: string } & Partial<Event>) | null

export type DeleteEventVehicleApiResponseBody = ({ message?: string } & Partial<Event>) | null

export type RegisterEventAccessApiResponseBody = ({ message?: string } & Partial<Event>) | null
