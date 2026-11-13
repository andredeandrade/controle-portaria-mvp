import { describeCrudServiceContract } from '@test/crud-service-contract'
import { NOVO_MORADOR } from '@test/factories/payloads'

import {
  ResidentsServiceError,
  deleteResident,
  getResident,
  listResidents,
  registerResident,
  updateResident,
} from './service'

describeCrudServiceContract({
  bffPath: '/api/residents',
  ServiceError: ResidentsServiceError,
  list: listResidents,
  register: registerResident,
  get: getResident,
  update: updateResident,
  remove: deleteResident,
  createPayload: NOVO_MORADOR,
  deleteBy: 'body',
})
