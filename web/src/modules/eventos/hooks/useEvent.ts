'use client'

import { useQuery } from '@tanstack/react-query'

import { EventsServiceError, getEvent } from '@/services/eventos/service'

/**
 * Busca um único evento pelo id, para uso no formulário de edição.
 */
export function useEvent(id: string) {
  const eventQuery = useQuery({
    queryKey: ['events', id],
    queryFn: () => getEvent(id),
    enabled: Boolean(id),
  })

  return {
    event: eventQuery.data,
    isLoading: eventQuery.isPending,
    isError: eventQuery.isError,
    errorMessage: (eventQuery.error as EventsServiceError | null)?.message ?? 'Erro ao carregar evento.',
    refetch: eventQuery.refetch,
  }
}
