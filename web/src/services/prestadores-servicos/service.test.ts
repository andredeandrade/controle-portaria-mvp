import { describeCrudServiceContract } from '@test/crud-service-contract'
import { NOVO_PRESTADOR } from '@test/factories/payloads'

import {
  ServiceProvidersServiceError,
  deleteServiceProvider,
  getServiceProvider,
  listServiceProviders,
  registerServiceProvider,
  updateServiceProvider,
} from './service'

describeCrudServiceContract({
  bffPath: '/api/service-providers',
  ServiceError: ServiceProvidersServiceError,
  list: listServiceProviders,
  register: registerServiceProvider,
  get: getServiceProvider,
  update: updateServiceProvider,
  remove: deleteServiceProvider,
  createPayload: NOVO_PRESTADOR,
  deleteBy: 'body',
})
