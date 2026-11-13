import type {
  CreateIncidentRequest,
  Incident,
  IncidentsListResponse,
} from '@/app/api/incidents/types'
import { getApiErrorMessage, safeReadJson } from '@/services/shared/http'
import type {
  GetIncidentApiResponseBody,
  ListIncidentsApiResponseBody,
  RegisterIncidentApiResponseBody,
  UpdateIncidentApiResponseBody,
} from '@/types/services/ocorrencias'

export class IncidentsServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'IncidentsServiceError'
  }
}

export async function listIncidents(
  page: number,
  pageSize: number,
  search: string,
): Promise<IncidentsListResponse> {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })

  if (search.trim()) {
    query.set('search', search.trim())
  }

  const response = await fetch(`/api/incidents?${query.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  const payload = (await safeReadJson(response)) as ListIncidentsApiResponseBody

  if (!response.ok) {
    throw new IncidentsServiceError(
      getApiErrorMessage(payload, 'Nao foi possivel carregar as ocorrencias.'),
    )
  }

  if (!payload?.items || !payload.pagination) {
    throw new IncidentsServiceError('Resposta invalida ao carregar ocorrencias.')
  }

  return payload as IncidentsListResponse
}

export async function registerIncident(payload: CreateIncidentRequest): Promise<Incident> {
  const response = await fetch('/api/incidents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const responseBody = (await safeReadJson(response)) as RegisterIncidentApiResponseBody

  if (!response.ok) {
    throw new IncidentsServiceError(
      getApiErrorMessage(responseBody, 'Nao foi possivel cadastrar a ocorrencia.'),
    )
  }

  if (!responseBody?.id) {
    throw new IncidentsServiceError('Resposta invalida ao cadastrar ocorrencia.')
  }

  return responseBody as Incident
}

export async function getIncident(id: string): Promise<Incident> {
  const response = await fetch(`/api/incidents/${id}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  const payload = (await safeReadJson(response)) as GetIncidentApiResponseBody

  if (!response.ok) {
    throw new IncidentsServiceError(
      getApiErrorMessage(payload, 'Não foi possível carregar a ocorrência.'),
    )
  }

  if (!payload?.id) {
    throw new IncidentsServiceError('Resposta inválida ao carregar ocorrência.')
  }

  return payload as Incident
}

export async function updateIncident(
  id: string,
  payload: CreateIncidentRequest,
): Promise<Incident> {
  const response = await fetch(`/api/incidents/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const responseBody = (await safeReadJson(response)) as UpdateIncidentApiResponseBody

  if (!response.ok) {
    throw new IncidentsServiceError(
      getApiErrorMessage(responseBody, 'Não foi possível atualizar a ocorrência.'),
    )
  }

  if (!responseBody?.id) {
    throw new IncidentsServiceError('Resposta inválida ao atualizar ocorrência.')
  }

  return responseBody as Incident
}

export async function deleteIncident(id: string): Promise<void> {
  const response = await fetch(`/api/incidents/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    const payload = await safeReadJson(response)
    throw new IncidentsServiceError(
      getApiErrorMessage(payload, 'Nao foi possivel excluir a ocorrencia.'),
    )
  }
}
