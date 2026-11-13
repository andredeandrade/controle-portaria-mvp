import { Router } from 'express'
import { authenticate } from '../../middlewares/authenticate.js'
import { authorizePermission } from '../../middlewares/authorize.js'
import { serviceProvidersController } from './service-providers.controller.js'

export const serviceProvidersRouter = Router()

serviceProvidersRouter.use(authenticate)

serviceProvidersRouter.post(
  '/',
  authorizePermission('service-providers', 'create'),
  serviceProvidersController.create,
)
serviceProvidersRouter.get(
  '/',
  authorizePermission('service-providers', 'view'),
  serviceProvidersController.list,
)
serviceProvidersRouter.get(
  '/:id',
  authorizePermission('service-providers', 'view'),
  serviceProvidersController.getById,
)
serviceProvidersRouter.patch(
  '/:id',
  authorizePermission('service-providers', 'update'),
  serviceProvidersController.update,
)
serviceProvidersRouter.delete(
  '/:id',
  authorizePermission('service-providers', 'remove'),
  serviceProvidersController.remove,
)
