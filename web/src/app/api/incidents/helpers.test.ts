import { describeDomainHelpersContract } from '@test/bff-helpers-contract'

import {
  IncidentsApiError,
  clearAccessToken,
  getErrorMessage,
  readAccessToken,
  requestIncidentsApi,
} from './helpers'

describeDomainHelpersContract({
  resourcePath: '/incidents',
  request: requestIncidentsApi,
  ApiError: IncidentsApiError,
  getErrorMessage,
  readAccessToken,
  clearAccessToken,
  fallbackMessage: 'Falha ao consultar ocorrencias.',
  networkErrorMessage: 'Nao foi possivel conectar ao servico de ocorrencias.',
  readsExpressErrorField: true,
})
