'use client'

import { useQuery } from '@tanstack/react-query'

import { getResident, ResidentsServiceError } from '@/services/moradores/service'

/**
 * Busca um único morador pelo id, para uso no formulário de edição.
 */
export function useResident(id: string) {
  const residentQuery = useQuery({
    queryKey: ['residents', id],
    queryFn: () => getResident(id),
    enabled: Boolean(id),
  })

  return {
    resident: residentQuery.data,
    isLoading: residentQuery.isPending,
    isError: residentQuery.isError,
    errorMessage:
      (residentQuery.error as ResidentsServiceError | null)?.message ??
      'Erro ao carregar morador.',
    refetch: residentQuery.refetch,
  }
}
