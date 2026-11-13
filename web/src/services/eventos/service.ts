import type {
  CheckInEventGuestRequest,
  CheckOutEventVehicleRequest,
  CreateEventGuestRequest,
  CreateEventRequest,
  CreateEventVehicleRequest,
  Event,
  EventsListResponse,
  RegisterEventAccessRequest,
  UpdateEventRequest,
} from '@/app/api/events/types'
import { getApiErrorMessage, safeReadJson } from '@/services/shared/http'
import type {
  CheckInEventGuestApiResponseBody,
  CheckOutEventGuestApiResponseBody,
  CheckOutEventVehicleApiResponseBody,
  CreateEventGuestApiResponseBody,
  CreateEventVehicleApiResponseBody,
  DeleteEventVehicleApiResponseBody,
  GetEventApiResponseBody,
  ListEventsApiResponseBody,
  RegisterEventAccessApiResponseBody,
  RegisterEventApiResponseBody,
  UpdateEventApiResponseBody,
} from '@/types/services/eventos'

export class EventsServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EventsServiceError'
  }
}

export async function listEvents(
  page: number,
  pageSize: number,
  search: string,
): Promise<EventsListResponse> {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })

  if (search.trim()) {
    query.set('search', search.trim())
  }

  const response = await fetch(`/api/events?${query.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  const payload = (await safeReadJson(response)) as ListEventsApiResponseBody

  if (!response.ok) {
    throw new EventsServiceError(
      getApiErrorMessage(payload, 'Nao foi possivel carregar os eventos.'),
    )
  }

  if (!payload?.items || !payload.pagination) {
    throw new EventsServiceError('Resposta invalida ao carregar eventos.')
  }

  return payload as EventsListResponse
}

export async function registerEvent(payload: CreateEventRequest): Promise<Event> {
  const response = await fetch('/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const responseBody = (await safeReadJson(response)) as RegisterEventApiResponseBody

  if (!response.ok) {
    throw new EventsServiceError(
      getApiErrorMessage(responseBody, 'Nao foi possivel cadastrar o evento.'),
    )
  }

  if (!responseBody?.id) {
    throw new EventsServiceError('Resposta invalida ao cadastrar evento.')
  }

  return responseBody as Event
}

export async function getEvent(id: string): Promise<Event> {
  const response = await fetch(`/api/events/${id}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  const payload = (await safeReadJson(response)) as GetEventApiResponseBody

  if (!response.ok) {
    throw new EventsServiceError(getApiErrorMessage(payload, 'Não foi possível carregar o evento.'))
  }

  if (!payload?.id) {
    throw new EventsServiceError('Resposta inválida ao carregar evento.')
  }

  return payload as Event
}

export async function updateEvent(id: string, payload: UpdateEventRequest): Promise<Event> {
  const response = await fetch(`/api/events/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const responseBody = (await safeReadJson(response)) as UpdateEventApiResponseBody

  if (!response.ok) {
    throw new EventsServiceError(
      getApiErrorMessage(responseBody, 'Não foi possível atualizar o evento.'),
    )
  }

  if (!responseBody?.id) {
    throw new EventsServiceError('Resposta inválida ao atualizar evento.')
  }

  return responseBody as Event
}

export async function deleteEvent(id: string): Promise<void> {
  const response = await fetch('/api/events', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ id }),
  })

  if (!response.ok) {
    const payload = await safeReadJson(response)
    throw new EventsServiceError(getApiErrorMessage(payload, 'Não foi possível excluir o evento.'))
  }
}

export async function checkInEventGuest({
  eventId,
  guestId,
  ...payload
}: {
  eventId: string
  guestId: string
} & CheckInEventGuestRequest): Promise<Event> {
  const response = await fetch('/api/events/guests/check-in', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ eventId, guestId, ...payload }),
  })

  const responseBody = (await safeReadJson(response)) as CheckInEventGuestApiResponseBody

  if (!response.ok) {
    throw new EventsServiceError(
      getApiErrorMessage(responseBody, 'Não foi possível registrar a entrada do convidado.'),
    )
  }

  if (!responseBody?.id) {
    throw new EventsServiceError('Resposta inválida ao registrar a entrada do convidado.')
  }

  return responseBody as Event
}

export async function checkOutEventGuest({
  eventId,
  guestId,
}: {
  eventId: string
  guestId: string
}): Promise<Event> {
  const response = await fetch('/api/events/guests/check-out', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ eventId, guestId }),
  })

  const responseBody = (await safeReadJson(response)) as CheckOutEventGuestApiResponseBody

  if (!response.ok) {
    throw new EventsServiceError(
      getApiErrorMessage(responseBody, 'Não foi possível registrar a saída do convidado.'),
    )
  }

  if (!responseBody?.id) {
    throw new EventsServiceError('Resposta inválida ao registrar a saída do convidado.')
  }

  return responseBody as Event
}

export async function createEventVehicle({
  eventId,
  ...payload
}: { eventId: string } & CreateEventVehicleRequest): Promise<Event> {
  const response = await fetch('/api/events/vehicles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ eventId, ...payload }),
  })

  const responseBody = (await safeReadJson(response)) as CreateEventVehicleApiResponseBody

  if (!response.ok) {
    throw new EventsServiceError(
      getApiErrorMessage(responseBody, 'Não foi possível adicionar o veículo.'),
    )
  }

  if (!responseBody?.id) {
    throw new EventsServiceError('Resposta inválida ao adicionar o veículo.')
  }

  return responseBody as Event
}

export async function createEventGuest({
  eventId,
  ...payload
}: { eventId: string } & CreateEventGuestRequest): Promise<Event> {
  const response = await fetch('/api/events/guests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ eventId, ...payload }),
  })

  const responseBody = (await safeReadJson(response)) as CreateEventGuestApiResponseBody

  if (!response.ok) {
    throw new EventsServiceError(
      getApiErrorMessage(responseBody, 'Não foi possível adicionar o convidado.'),
    )
  }

  if (!responseBody?.id) {
    throw new EventsServiceError('Resposta inválida ao adicionar o convidado.')
  }

  return responseBody as Event
}

export async function checkOutEventVehicle({
  eventId,
  vehicleId,
  ...payload
}: {
  eventId: string
  vehicleId: string
} & CheckOutEventVehicleRequest): Promise<Event> {
  const response = await fetch('/api/events/vehicles/check-out', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ eventId, vehicleId, ...payload }),
  })

  const responseBody = (await safeReadJson(response)) as CheckOutEventVehicleApiResponseBody

  if (!response.ok) {
    throw new EventsServiceError(
      getApiErrorMessage(responseBody, 'Não foi possível registrar a saída do veículo.'),
    )
  }

  if (!responseBody?.id) {
    throw new EventsServiceError('Resposta inválida ao registrar a saída do veículo.')
  }

  return responseBody as Event
}

export async function deleteEventVehicle({
  eventId,
  vehicleId,
}: {
  eventId: string
  vehicleId: string
}): Promise<Event> {
  const response = await fetch('/api/events/vehicles', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ eventId, vehicleId }),
  })

  const responseBody = (await safeReadJson(response)) as DeleteEventVehicleApiResponseBody

  if (!response.ok) {
    throw new EventsServiceError(
      getApiErrorMessage(responseBody, 'Não foi possível remover o veículo.'),
    )
  }

  if (!responseBody?.id) {
    throw new EventsServiceError('Resposta inválida ao remover o veículo.')
  }

  return responseBody as Event
}

export async function registerEventAccess(
  eventId: string,
  payload: RegisterEventAccessRequest,
): Promise<Event> {
  const response = await fetch('/api/events/access', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ eventId, ...payload }),
  })

  const responseBody = (await safeReadJson(response)) as RegisterEventAccessApiResponseBody

  if (!response.ok) {
    throw new EventsServiceError(
      getApiErrorMessage(responseBody, 'Não foi possível registrar o acesso.'),
    )
  }

  if (!responseBody?.id) {
    throw new EventsServiceError('Resposta inválida ao registrar o acesso.')
  }

  return responseBody as Event
}
