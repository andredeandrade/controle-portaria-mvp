import { describeDomainHelpersContract } from '@test/bff-helpers-contract'

import {
  DashboardApiError,
  clearAccessToken,
  getErrorMessage,
  readAccessToken,
  requestDashboardApi,
} from './helpers'

describeDomainHelpersContract({
  resourcePath: '/dashboard',
  request: requestDashboardApi,
  ApiError: DashboardApiError,
  getErrorMessage,
  readAccessToken,
  clearAccessToken,
  fallbackMessage: 'Falha ao consultar o dashboard.',
  networkErrorMessage: 'Não foi possível conectar ao serviço de dashboard.',
  readsExpressErrorField: true,
})
