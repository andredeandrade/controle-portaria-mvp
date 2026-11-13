'use client'

import type { LogoutResponse } from '@/app/api/auth/logout/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LogoutServiceError, logout } from '@/services/auth/service'

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation<LogoutResponse, LogoutServiceError>({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear()
    },
  })
}
