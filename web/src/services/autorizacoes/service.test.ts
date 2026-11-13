import { describeCrudServiceContract } from '@test/crud-service-contract'
import { NOVA_AUTORIZACAO } from '@test/factories/payloads'

import {
  AuthorizationsServiceError,
  deleteAuthorization,
  getAuthorization,
  listAuthorizations,
  registerAuthorization,
  updateAuthorization,
} from './service'

describeCrudServiceContract({
  bffPath: '/api/authorizations',
  ServiceError: AuthorizationsServiceError,
  list: listAuthorizations,
  register: registerAuthorization,
  get: getAuthorization,
  update: updateAuthorization,
  remove: deleteAuthorization,
  createPayload: NOVA_AUTORIZACAO,
  deleteBy: 'body',
})
