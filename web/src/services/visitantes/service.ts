import type { CreateVisitorRequest, Visitor, VisitorsListResponse } from '@/app/api/visitors/types'
import { getApiErrorMessage, safeReadJson } from '@/services/shared/http'
import type {
  GetVisitorApiResponseBody,
  ListVisitorsApiResponseBody,
  RegisterVisitorApiResponseBody,
  UpdateVisitorApiResponseBody,
} from '@/types/services/visitantes'

export class VisitorsServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'VisitorsServiceError'
  }
}

export async function listVisitors(
  page: number,
  pageSize: number,
  search: string,
): Promise<VisitorsListResponse> {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })

  if (search.trim()) {
    query.set('search', search.trim())
  }

  const response = await fetch(`/api/visitors?${query.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  const payload = (await safeReadJson(response)) as ListVisitorsApiResponseBody

  if (!response.ok) {
    throw new VisitorsServiceError(
      getApiErrorMessage(payload, 'Nao foi possivel carregar os visitantes.'),
    )
  }

  if (!payload?.items || !payload.pagination) {
    throw new VisitorsServiceError('Resposta invalida ao carregar visitantes.')
  }

  return payload as VisitorsListResponse
}

export async function registerVisitor(payload: CreateVisitorRequest): Promise<Visitor> {
  const response = await fetch('/api/visitors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const responseBody = (await safeReadJson(response)) as RegisterVisitorApiResponseBody

  if (!response.ok) {
    throw new VisitorsServiceError(
      getApiErrorMessage(responseBody, 'Nao foi possivel cadastrar o visitante.'),
    )
  }

  if (!responseBody?.id) {
    throw new VisitorsServiceError('Resposta invalida ao cadastrar visitante.')
  }

  return responseBody as Visitor
}

export async function getVisitor(id: string): Promise<Visitor> {
  const response = await fetch(`/api/visitors/${id}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  const payload = (await safeReadJson(response)) as GetVisitorApiResponseBody

  if (!response.ok) {
    throw new VisitorsServiceError(
      getApiErrorMessage(payload, 'Não foi possível carregar o visitante.'),
    )
  }

  if (!payload?.id) {
    throw new VisitorsServiceError('Resposta inválida ao carregar visitante.')
  }

  return payload as Visitor
}

export async function updateVisitor(
  id: string,
  payload: CreateVisitorRequest,
): Promise<Visitor> {
  const response = await fetch(`/api/visitors/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const responseBody = (await safeReadJson(response)) as UpdateVisitorApiResponseBody

  if (!response.ok) {
    throw new VisitorsServiceError(
      getApiErrorMessage(responseBody, 'Não foi possível atualizar o visitante.'),
    )
  }

  if (!responseBody?.id) {
    throw new VisitorsServiceError('Resposta inválida ao atualizar visitante.')
  }

  return responseBody as Visitor
}

export async function deleteVisitor(id: string): Promise<void> {
  const response = await fetch('/api/visitors', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ id }),
  })

  if (!response.ok) {
    const payload = await safeReadJson(response)
    throw new VisitorsServiceError(
      getApiErrorMessage(payload, 'Não foi possível excluir o visitante.'),
    )
  }
}
