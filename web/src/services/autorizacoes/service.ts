import type {
  Authorization,
  AuthorizationsListResponse,
  CreateAuthorizationRequest,
} from '@/app/api/authorizations/types'
import { getApiErrorMessage, safeReadJson } from '@/services/shared/http'
import type {
  GetAuthorizationApiResponseBody,
  ListAuthorizationsApiResponseBody,
  RegisterAuthorizationApiResponseBody,
  UpdateAuthorizationApiResponseBody,
} from '@/types/services/autorizacoes'

export class AuthorizationsServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthorizationsServiceError'
  }
}

export async function listAuthorizations(
  page: number,
  pageSize: number,
  search: string,
): Promise<AuthorizationsListResponse> {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })

  if (search.trim()) {
    query.set('search', search.trim())
  }

  const response = await fetch(`/api/authorizations?${query.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  const payload = (await safeReadJson(response)) as ListAuthorizationsApiResponseBody

  if (!response.ok) {
    throw new AuthorizationsServiceError(
      getApiErrorMessage(payload, 'Nao foi possivel carregar as autorizacoes.'),
    )
  }

  if (!payload?.items || !payload.pagination) {
    throw new AuthorizationsServiceError('Resposta invalida ao carregar autorizacoes.')
  }

  return payload as AuthorizationsListResponse
}

export async function registerAuthorization(
  payload: CreateAuthorizationRequest,
): Promise<Authorization> {
  const response = await fetch('/api/authorizations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const responseBody = (await safeReadJson(response)) as RegisterAuthorizationApiResponseBody

  if (!response.ok) {
    throw new AuthorizationsServiceError(
      getApiErrorMessage(responseBody, 'Nao foi possivel cadastrar a autorizacao.'),
    )
  }

  if (!responseBody?.id) {
    throw new AuthorizationsServiceError('Resposta invalida ao cadastrar autorizacao.')
  }

  return responseBody as Authorization
}

export async function getAuthorization(id: string): Promise<Authorization> {
  const response = await fetch(`/api/authorizations/${id}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  const payload = (await safeReadJson(response)) as GetAuthorizationApiResponseBody

  if (!response.ok) {
    throw new AuthorizationsServiceError(
      getApiErrorMessage(payload, 'Não foi possível carregar a autorização.'),
    )
  }

  if (!payload?.id) {
    throw new AuthorizationsServiceError('Resposta inválida ao carregar autorização.')
  }

  return payload as Authorization
}

export async function updateAuthorization(
  id: string,
  payload: CreateAuthorizationRequest,
): Promise<Authorization> {
  const response = await fetch(`/api/authorizations/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const responseBody = (await safeReadJson(response)) as UpdateAuthorizationApiResponseBody

  if (!response.ok) {
    throw new AuthorizationsServiceError(
      getApiErrorMessage(responseBody, 'Não foi possível atualizar a autorização.'),
    )
  }

  if (!responseBody?.id) {
    throw new AuthorizationsServiceError('Resposta inválida ao atualizar autorização.')
  }

  return responseBody as Authorization
}

export async function deleteAuthorization(id: string): Promise<void> {
  const response = await fetch('/api/authorizations', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ id }),
  })

  if (!response.ok) {
    const payload = await safeReadJson(response)
    throw new AuthorizationsServiceError(
      getApiErrorMessage(payload, 'Não foi possível excluir a autorização.'),
    )
  }
}
