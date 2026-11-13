import type {
  CreateServiceProviderRequest,
  ServiceProvider,
  ServiceProvidersListResponse,
} from '@/app/api/service-providers/types'
import { getApiErrorMessage, safeReadJson } from '@/services/shared/http'
import type {
  GetServiceProviderApiResponseBody,
  ListServiceProvidersApiResponseBody,
  RegisterServiceProviderApiResponseBody,
  UpdateServiceProviderApiResponseBody,
} from '@/types/services/prestadores-servicos'

export class ServiceProvidersServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ServiceProvidersServiceError'
  }
}

export async function listServiceProviders(
  page: number,
  pageSize: number,
  search: string,
): Promise<ServiceProvidersListResponse> {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })

  if (search.trim()) {
    query.set('search', search.trim())
  }

  const response = await fetch(`/api/service-providers?${query.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  const payload = (await safeReadJson(response)) as ListServiceProvidersApiResponseBody

  if (!response.ok) {
    throw new ServiceProvidersServiceError(
      getApiErrorMessage(payload, 'Nao foi possivel carregar os prestadores.'),
    )
  }

  if (!payload?.items || !payload.pagination) {
    throw new ServiceProvidersServiceError('Resposta invalida ao carregar prestadores.')
  }

  return payload as ServiceProvidersListResponse
}

export async function registerServiceProvider(
  payload: CreateServiceProviderRequest,
): Promise<ServiceProvider> {
  const response = await fetch('/api/service-providers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const responseBody = (await safeReadJson(response)) as RegisterServiceProviderApiResponseBody

  if (!response.ok) {
    throw new ServiceProvidersServiceError(
      getApiErrorMessage(responseBody, 'Nao foi possivel cadastrar o prestador.'),
    )
  }

  if (!responseBody?.id) {
    throw new ServiceProvidersServiceError('Resposta invalida ao cadastrar prestador.')
  }

  return responseBody as ServiceProvider
}

export async function getServiceProvider(id: string): Promise<ServiceProvider> {
  const response = await fetch(`/api/service-providers/${id}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  const payload = (await safeReadJson(response)) as GetServiceProviderApiResponseBody

  if (!response.ok) {
    throw new ServiceProvidersServiceError(
      getApiErrorMessage(payload, 'Não foi possível carregar o prestador de serviço.'),
    )
  }

  if (!payload?.id) {
    throw new ServiceProvidersServiceError('Resposta inválida ao carregar prestador de serviço.')
  }

  return payload as ServiceProvider
}

export async function updateServiceProvider(
  id: string,
  payload: CreateServiceProviderRequest,
): Promise<ServiceProvider> {
  const response = await fetch(`/api/service-providers/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const responseBody = (await safeReadJson(response)) as UpdateServiceProviderApiResponseBody

  if (!response.ok) {
    throw new ServiceProvidersServiceError(
      getApiErrorMessage(responseBody, 'Não foi possível atualizar o prestador de serviço.'),
    )
  }

  if (!responseBody?.id) {
    throw new ServiceProvidersServiceError('Resposta inválida ao atualizar prestador de serviço.')
  }

  return responseBody as ServiceProvider
}

export async function deleteServiceProvider(id: string): Promise<void> {
  const response = await fetch('/api/service-providers', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ id }),
  })

  if (!response.ok) {
    const payload = await safeReadJson(response)
    throw new ServiceProvidersServiceError(
      getApiErrorMessage(payload, 'Não foi possível excluir o prestador de serviço.'),
    )
  }
}
