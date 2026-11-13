import { describeDomainHelpersContract } from '@test/bff-helpers-contract'

import {
  EventsApiError,
  clearAccessToken,
  getErrorMessage,
  readAccessToken,
  requestEventsApi,
} from './helpers'

describeDomainHelpersContract({
  resourcePath: '/events',
  request: requestEventsApi,
  ApiError: EventsApiError,
  getErrorMessage,
  readAccessToken,
  clearAccessToken,
  fallbackMessage: 'Falha ao consultar eventos.',
  networkErrorMessage: 'Não foi possível conectar ao serviço de eventos.',
  readsExpressErrorField: true,
})
