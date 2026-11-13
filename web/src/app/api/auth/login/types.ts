import type { UserRole } from '@/app/api/auth/me/types'

export type LoginRequestBody = {
  email?: unknown
  password?: unknown
  condominiumSlug?: unknown
}

export type LoginApiResponse = {
  token: string
  user: {
    id: string
    condominiumId: string
    name: string
    email: string
    role: UserRole
  }
}

export type CondominiumIdResponse = {
  id: string
}
