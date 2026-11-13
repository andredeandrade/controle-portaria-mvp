import { describeDomainHelpersContract } from '@test/bff-helpers-contract'

import {
  VisitorsApiError,
  clearAccessToken,
  getErrorMessage,
  readAccessToken,
  requestVisitorsApi,
} from './helpers'

describeDomainHelpersContract({
  resourcePath: '/visitors',
  request: requestVisitorsApi,
  ApiError: VisitorsApiError,
  getErrorMessage,
  readAccessToken,
  clearAccessToken,
  fallbackMessage: 'Falha ao consultar visitantes.',
  networkErrorMessage: 'Não foi possível conectar ao serviço de visitantes.',
  // BUG: getErrorMessage só lê `message`; a API responde `{ error }`.
  readsExpressErrorField: true,
})
