import { describeDomainHelpersContract } from '@test/bff-helpers-contract'

import {
  ServiceProvidersApiError,
  clearAccessToken,
  getErrorMessage,
  readAccessToken,
  requestServiceProvidersApi,
} from './helpers'

describeDomainHelpersContract({
  resourcePath: '/service-providers',
  request: requestServiceProvidersApi,
  ApiError: ServiceProvidersApiError,
  getErrorMessage,
  readAccessToken,
  clearAccessToken,
  fallbackMessage: 'Falha ao consultar prestadores de serviço.',
  networkErrorMessage: 'Não foi possível conectar ao serviço de prestadores.',
  readsExpressErrorField: true,
})
