'use client'

import { useQuery } from '@tanstack/react-query'

import { getAuthorization, AuthorizationsServiceError } from '@/services/autorizacoes/service'

/**
 * Busca uma única autorização pelo id, para uso no formulário de edição.
 */
export function useAuthorization(id: string) {
  const authorizationQuery = useQuery({
    queryKey: ['authorizations', id],
    queryFn: () => getAuthorization(id),
    enabled: Boolean(id),
  })

  return {
    authorization: authorizationQuery.data,
    isLoading: authorizationQuery.isPending,
    isError: authorizationQuery.isError,
    errorMessage:
      (authorizationQuery.error as AuthorizationsServiceError | null)?.message ??
      'Erro ao carregar autorização.',
    refetch: authorizationQuery.refetch,
  }
}
