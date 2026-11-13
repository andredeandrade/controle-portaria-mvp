import type { AuthenticatedUser } from '@/app/api/auth/me/types'

export type LoginPayload = {
  email: string
  password: string
  condominiumSlug?: string
}

export type LoginResponse = {
  user: AuthenticatedUser
}

export type AuthApiResponseBody = {
  message?: string
  user?: AuthenticatedUser
}

export type LogoutApiResponseBody = {
  message?: string
  success?: boolean
}
