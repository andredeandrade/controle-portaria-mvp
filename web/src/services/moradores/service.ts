import type {
  CreateResidentRequest,
  Resident,
  ResidentsListResponse,
} from '@/app/api/residents/types'
import { getApiErrorMessage, safeReadJson } from '@/services/shared/http'
import type {
  GetResidentApiResponseBody,
  ListResidentsApiResponseBody,
  RegisterResidentApiResponseBody,
  UpdateResidentApiResponseBody,
} from '@/types/services/moradores'

export class ResidentsServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ResidentsServiceError'
  }
}

export async function listResidents(
  page: number,
  pageSize: number,
  search: string,
): Promise<ResidentsListResponse> {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })

  if (search.trim()) {
    query.set('search', search.trim())
  }

  const response = await fetch(`/api/residents?${query.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  const payload = (await safeReadJson(response)) as ListResidentsApiResponseBody

  if (!response.ok) {
    throw new ResidentsServiceError(
      getApiErrorMessage(payload, 'Nao foi possivel carregar os moradores.'),
    )
  }

  if (!payload?.items || !payload.pagination) {
    throw new ResidentsServiceError('Resposta invalida ao carregar moradores.')
  }

  return payload as ResidentsListResponse
}

export async function registerResident(payload: CreateResidentRequest): Promise<Resident> {
  const response = await fetch('/api/residents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const responseBody = (await safeReadJson(response)) as RegisterResidentApiResponseBody

  if (!response.ok) {
    throw new ResidentsServiceError(
      getApiErrorMessage(responseBody, 'Nao foi possivel cadastrar o morador.'),
    )
  }

  if (!responseBody?.id) {
    throw new ResidentsServiceError('Resposta invalida ao cadastrar morador.')
  }

  return responseBody as Resident
}

export async function getResident(id: string): Promise<Resident> {
  const response = await fetch(`/api/residents/${id}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  const payload = (await safeReadJson(response)) as GetResidentApiResponseBody

  if (!response.ok) {
    throw new ResidentsServiceError(
      getApiErrorMessage(payload, 'Não foi possível carregar o morador.'),
    )
  }

  if (!payload?.id) {
    throw new ResidentsServiceError('Resposta inválida ao carregar morador.')
  }

  return payload as Resident
}

export async function updateResident(
  id: string,
  payload: CreateResidentRequest,
): Promise<Resident> {
  const response = await fetch(`/api/residents/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const responseBody = (await safeReadJson(response)) as UpdateResidentApiResponseBody

  if (!response.ok) {
    throw new ResidentsServiceError(
      getApiErrorMessage(responseBody, 'Não foi possível atualizar o morador.'),
    )
  }

  if (!responseBody?.id) {
    throw new ResidentsServiceError('Resposta inválida ao atualizar morador.')
  }

  return responseBody as Resident
}

export async function deleteResident(id: string): Promise<void> {
  const response = await fetch('/api/residents', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ id }),
  })

  if (!response.ok) {
    const payload = await safeReadJson(response)
    throw new ResidentsServiceError(
      getApiErrorMessage(payload, 'Não foi possível excluir o morador.'),
    )
  }
}
