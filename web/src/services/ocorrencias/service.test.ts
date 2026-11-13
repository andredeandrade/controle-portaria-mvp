import { describeCrudServiceContract } from '@test/crud-service-contract'
import { NOVA_OCORRENCIA } from '@test/factories/payloads'

import {
  IncidentsServiceError,
  deleteIncident,
  getIncident,
  listIncidents,
  registerIncident,
  updateIncident,
} from './service'

describeCrudServiceContract({
  bffPath: '/api/incidents',
  ServiceError: IncidentsServiceError,
  list: listIncidents,
  register: registerIncident,
  get: getIncident,
  update: updateIncident,
  remove: deleteIncident,
  createPayload: NOVA_OCORRENCIA,
  // Diferente dos demais domínios: o BFF expõe DELETE em `/api/incidents/[id]`.
  deleteBy: 'path',
})
