import { Router } from 'express'
import { authenticate } from '../../middlewares/authenticate.js'
import { authorizePermission } from '../../middlewares/authorize.js'
import { incidentsController } from './incidents.controller.js'

export const incidentsRouter = Router()

incidentsRouter.use(authenticate)

incidentsRouter.post('/', authorizePermission('incidents', 'create'), incidentsController.create)
incidentsRouter.get('/', authorizePermission('incidents', 'view'), incidentsController.list)
incidentsRouter.get(
  '/:id',
  authorizePermission('incidents', 'view'),
  incidentsController.getById,
)
incidentsRouter.patch(
  '/:id',
  authorizePermission('incidents', 'update'),
  incidentsController.update,
)
incidentsRouter.delete(
  '/:id',
  authorizePermission('incidents', 'remove'),
  incidentsController.remove,
)
