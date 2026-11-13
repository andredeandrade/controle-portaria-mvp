import type { UserRole } from '../../lib/jwt.js'

export interface RegisterInput {
  condominiumId: string
  name: string
  email: string
  password: string
  role?: UserRole
}

export interface LoginInput {
  condominiumId: string
  email: string
  password: string
}

export interface AuthenticatedUser {
  id: string
  condominiumId: string
  email: string
  role: UserRole
  name: string
}
