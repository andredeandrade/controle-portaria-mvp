'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LoginServiceError, login } from '@/services/auth/service'
import type { LoginPayload, LoginResponse } from '@/types/services/auth'

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation<LoginResponse, LoginServiceError, LoginPayload>({
    mutationFn: login,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })
}
