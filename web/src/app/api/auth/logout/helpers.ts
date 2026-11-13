import { ACCESS_TOKEN_COOKIE_NAME } from '@/lib/auth/session'
import type { LogoutResponse } from './types'

export function clearAuthSession(cookieStore: { delete: (name: string) => void }): void {
  cookieStore.delete(ACCESS_TOKEN_COOKIE_NAME)
}

export function buildLogoutResponse(): LogoutResponse {
  return { success: true }
}
