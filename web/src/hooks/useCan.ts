'use client'

import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser'
import { hasPermission, type ResourceActionMap } from '@/lib/permissions/permissions'

/**
 * Verifica se o usuário autenticado possui permissão para executar uma ação
 * sobre um recurso, com base no role retornado por `useAuthenticatedUser`.
 */
export function useCan<Resource extends keyof ResourceActionMap>(
  resource: Resource,
  action: ResourceActionMap[Resource],
): boolean {
  const { data: user } = useAuthenticatedUser()

  return hasPermission(user?.role, resource, action)
}
