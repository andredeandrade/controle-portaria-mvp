'use client'

import { useQuery } from '@tanstack/react-query'

import { getServiceProvider, ServiceProvidersServiceError } from '@/services/prestadores-servicos/service'

/**
 * Busca um único prestador de serviço pelo id, para uso no formulário de edição.
 */
export function useServiceProvider(id: string) {
  const serviceProviderQuery = useQuery({
    queryKey: ['service-providers', id],
    queryFn: () => getServiceProvider(id),
    enabled: Boolean(id),
  })

  return {
    serviceProvider: serviceProviderQuery.data,
    isLoading: serviceProviderQuery.isPending,
    isError: serviceProviderQuery.isError,
    errorMessage:
      (serviceProviderQuery.error as ServiceProvidersServiceError | null)?.message ??
      'Erro ao carregar prestador de serviço.',
    refetch: serviceProviderQuery.refetch,
  }
}
