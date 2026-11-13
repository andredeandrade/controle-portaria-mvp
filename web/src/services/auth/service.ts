import type { AuthMeResponse } from '@/app/api/auth/me/types'
import type { LogoutResponse } from '@/app/api/auth/logout/types'
import { getApiErrorMessage, safeReadJson } from '@/services/shared/http'
import type {
  AuthApiResponseBody,
  LoginPayload,
  LoginResponse,
  LogoutApiResponseBody,
} from '@/types/services/auth'

export class LoginServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LoginServiceError'
  }
}

export class AuthMeServiceError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'AuthMeServiceError'
    this.status = status
  }
}

export class LogoutServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LogoutServiceError'
  }
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const responseBody = (await safeReadJson(response)) as AuthApiResponseBody

  if (!response.ok) {
    throw new LoginServiceError(getApiErrorMessage(responseBody, 'Falha ao autenticar.'))
  }

  if (!responseBody?.user) {
    throw new LoginServiceError('Resposta invalida de autenticacao.')
  }

  return { user: responseBody.user }
}

export async function getAuthenticatedUser(): Promise<AuthMeResponse> {
  const response = await fetch('/api/auth/me', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  const responseBody = (await safeReadJson(response)) as AuthApiResponseBody

  if (!response.ok) {
    throw new AuthMeServiceError(
      getApiErrorMessage(responseBody, 'Nao foi possivel carregar o usuario.'),
      response.status,
    )
  }

  if (!responseBody?.user) {
    throw new AuthMeServiceError('Resposta invalida ao carregar usuario autenticado.', 500)
  }

  return { user: responseBody.user }
}

export async function logout(): Promise<LogoutResponse> {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
  })

  const responseBody = (await safeReadJson(response)) as LogoutApiResponseBody

  if (!response.ok) {
    throw new LogoutServiceError(getApiErrorMessage(responseBody, 'Falha ao encerrar a sessao.'))
  }

  if (!responseBody?.success) {
    throw new LogoutServiceError('Resposta invalida ao encerrar sessao.')
  }

  return { success: true }
}
