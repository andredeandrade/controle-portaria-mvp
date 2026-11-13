'use client'

import type { AuthMeResponse, AuthenticatedUser } from '@/app/api/auth/me/types'
import { useQuery } from '@tanstack/react-query'
import { AuthMeServiceError, getAuthenticatedUser } from '@/services/auth/service'

export function useAuthenticatedUser() {
  return useQuery<AuthenticatedUser, AuthMeServiceError>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const data: AuthMeResponse = await getAuthenticatedUser()
      return data.user
    },
  })
}
