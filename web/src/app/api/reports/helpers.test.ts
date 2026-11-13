import { describeDomainHelpersContract } from '@test/bff-helpers-contract'

import { ReportsApiError, clearAccessToken, readAccessToken, requestReportsApi } from './helpers'

describeDomainHelpersContract({
  resourcePath: '/reports',
  request: requestReportsApi,
  ApiError: ReportsApiError,
  readAccessToken,
  clearAccessToken,
  fallbackMessage: 'Falha ao consultar relatórios.',
  networkErrorMessage: 'Nao foi possivel conectar ao servico de relatorios.',
  readsExpressErrorField: true,
})
