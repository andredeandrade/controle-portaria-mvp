'use client'

import { useQuery } from '@tanstack/react-query'

import { getVisitor, VisitorsServiceError } from '@/services/visitantes/service'

/**
 * Busca um único visitante pelo id, para uso no formulário de edição.
 */
export function useVisitor(id: string) {
  const visitorQuery = useQuery({
    queryKey: ['visitors', id],
    queryFn: () => getVisitor(id),
    enabled: Boolean(id),
  })

  return {
    visitor: visitorQuery.data,
    isLoading: visitorQuery.isPending,
    isError: visitorQuery.isError,
    errorMessage:
      (visitorQuery.error as VisitorsServiceError | null)?.message ??
      'Erro ao carregar visitante.',
    refetch: visitorQuery.refetch,
  }
}
