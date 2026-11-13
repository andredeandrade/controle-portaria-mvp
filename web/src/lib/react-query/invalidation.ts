import type { QueryClient, QueryKey } from '@tanstack/react-query'

export type DomainQueryKey =
  | 'access-records'
  | 'authorizations'
  | 'events'
  | 'incidents'
  | 'residents'
  | 'service-providers'
  | 'visitors'

const DASHBOARD_QUERY_KEY: QueryKey = ['dashboard']
const REPORTS_QUERY_KEY: QueryKey = ['reports']
const PERSON_SEARCH_QUERY_KEY: QueryKey = ['person-search']

/**
 * Queries afetadas pela mutation de cada dominio, alem da propria listagem:
 * resumo do dashboard (acessos ativos, autorizacoes, eventos), contagens dos
 * relatorios e busca de cadastro do registro de acesso.
 */
const RELATED_QUERY_KEYS: Record<DomainQueryKey, readonly QueryKey[]> = {
  'access-records': [['access-records'], DASHBOARD_QUERY_KEY, REPORTS_QUERY_KEY],
  authorizations: [
    ['authorizations'],
    DASHBOARD_QUERY_KEY,
    REPORTS_QUERY_KEY,
    PERSON_SEARCH_QUERY_KEY,
  ],
  events: [['events'], DASHBOARD_QUERY_KEY, REPORTS_QUERY_KEY],
  incidents: [['incidents'], REPORTS_QUERY_KEY],
  residents: [['residents'], REPORTS_QUERY_KEY, PERSON_SEARCH_QUERY_KEY],
  'service-providers': [['service-providers'], REPORTS_QUERY_KEY, PERSON_SEARCH_QUERY_KEY],
  visitors: [['visitors'], REPORTS_QUERY_KEY, PERSON_SEARCH_QUERY_KEY],
}

/**
 * Invalida a listagem do dominio e todas as queries derivadas dele, para que
 * telas como o dashboard reflitam a mutation sem precisar recarregar a pagina.
 */
export async function invalidateDomainQueries(queryClient: QueryClient, domain: DomainQueryKey) {
  await Promise.all(
    RELATED_QUERY_KEYS[domain].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  )
}
