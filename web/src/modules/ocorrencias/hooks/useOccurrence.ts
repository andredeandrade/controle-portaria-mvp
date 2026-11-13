'use client'

import { useQuery } from '@tanstack/react-query'

import { getIncident, IncidentsServiceError } from '@/services/ocorrencias/service'

/**
 * Busca uma única ocorrência pelo id, para uso no formulário de edição.
 */
export function useOccurrence(id: string) {
  const occurrenceQuery = useQuery({
    queryKey: ['incidents', id],
    queryFn: () => getIncident(id),
    enabled: Boolean(id),
  })

  return {
    occurrence: occurrenceQuery.data,
    isLoading: occurrenceQuery.isPending,
    isError: occurrenceQuery.isError,
    errorMessage:
      (occurrenceQuery.error as IncidentsServiceError | null)?.message ??
      'Erro ao carregar ocorrência.',
    refetch: occurrenceQuery.refetch,
  }
}
