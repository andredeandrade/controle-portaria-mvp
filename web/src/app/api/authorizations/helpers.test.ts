import { describeDomainHelpersContract } from '@test/bff-helpers-contract'

import {
  AuthorizationsApiError,
  clearAccessToken,
  getErrorMessage,
  readAccessToken,
  requestAuthorizationsApi,
} from './helpers'

describeDomainHelpersContract({
  resourcePath: '/authorizations',
  request: requestAuthorizationsApi,
  ApiError: AuthorizationsApiError,
  getErrorMessage,
  readAccessToken,
  clearAccessToken,
  fallbackMessage: 'Falha ao consultar autorizacoes.',
  networkErrorMessage: 'Nao foi possivel conectar ao servico de autorizacoes.',
  readsExpressErrorField: true,
})
