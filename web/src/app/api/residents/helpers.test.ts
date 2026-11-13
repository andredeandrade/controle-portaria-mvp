import { describeDomainHelpersContract } from '@test/bff-helpers-contract'

import {
  ResidentsApiError,
  clearAccessToken,
  getErrorMessage,
  readAccessToken,
  requestResidentsApi,
} from './helpers'

describeDomainHelpersContract({
  resourcePath: '/residents',
  request: requestResidentsApi,
  ApiError: ResidentsApiError,
  getErrorMessage,
  readAccessToken,
  clearAccessToken,
  fallbackMessage: 'Falha ao consultar moradores.',
  networkErrorMessage: 'Não foi possível conectar ao serviço de moradores.',
  // BUG: getErrorMessage só lê `message`; a API responde `{ error }`.
  readsExpressErrorField: true,
})
