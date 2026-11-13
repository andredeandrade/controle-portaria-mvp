import type {
  AccessRecord,
  AccessRecordsListResponse,
  CheckOutAccessRecordRequest,
  CreateAccessRecordRequest,
} from '@/app/api/access-records/types'
import { getApiErrorMessage, safeReadJson } from '@/services/shared/http'
import type {
  CheckOutAccessRecordApiResponseBody,
  ListAccessRecordsApiResponseBody,
  RegisterAccessRecordApiResponseBody,
} from '@/types/services/acessos'

export class AccessRecordsServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AccessRecordsServiceError'
  }
}

export async function listAccessRecords(
  page: number,
  pageSize: number,
  search: string,
  status: 'all' | 'open' | 'closed',
): Promise<AccessRecordsListResponse> {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    status,
  })

  if (search.trim()) {
    query.set('search', search.trim())
  }

  const response = await fetch(`/api/access-records?${query.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  const payload = (await safeReadJson(response)) as ListAccessRecordsApiResponseBody

  if (!response.ok) {
    throw new AccessRecordsServiceError(
      getApiErrorMessage(payload, 'Nao foi possivel carregar os registros de acesso.'),
    )
  }

  if (!payload?.items || !payload.pagination) {
    throw new AccessRecordsServiceError('Resposta invalida ao carregar os registros de acesso.')
  }

  return payload as AccessRecordsListResponse
}

export async function registerAccessRecord(
  payload: CreateAccessRecordRequest,
): Promise<AccessRecord> {
  const response = await fetch('/api/access-records', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const responseBody = (await safeReadJson(response)) as RegisterAccessRecordApiResponseBody

  if (!response.ok) {
    throw new AccessRecordsServiceError(
      getApiErrorMessage(responseBody, 'Nao foi possivel registrar a entrada.'),
    )
  }

  if (!responseBody?.id) {
    throw new AccessRecordsServiceError('Resposta invalida ao registrar a entrada.')
  }

  return responseBody as AccessRecord
}

export async function checkOutAccessRecord(
  payload: CheckOutAccessRecordRequest,
): Promise<AccessRecord> {
  const response = await fetch('/api/access-records/check-out', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const responseBody = (await safeReadJson(response)) as CheckOutAccessRecordApiResponseBody

  if (!response.ok) {
    throw new AccessRecordsServiceError(
      getApiErrorMessage(responseBody, 'Nao foi possivel registrar a saida.'),
    )
  }

  if (!responseBody?.id) {
    throw new AccessRecordsServiceError('Resposta invalida ao registrar a saida.')
  }

  return responseBody as AccessRecord
}
