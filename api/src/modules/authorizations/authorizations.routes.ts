import { Router } from 'express'
import { authenticate } from '../../middlewares/authenticate.js'
import { authorizePermission } from '../../middlewares/authorize.js'
import { authorizationsController } from './authorizations.controller.js'

export const authorizationsRouter = Router()

authorizationsRouter.use(authenticate)

authorizationsRouter.post(
  '/',
  authorizePermission('authorizations', 'create'),
  authorizationsController.create,
)
authorizationsRouter.get(
  '/',
  authorizePermission('authorizations', 'view'),
  authorizationsController.list,
)
authorizationsRouter.get(
  '/:id',
  authorizePermission('authorizations', 'view'),
  authorizationsController.getById,
)
authorizationsRouter.patch(
  '/:id',
  authorizePermission('authorizations', 'update'),
  authorizationsController.update,
)
authorizationsRouter.delete(
  '/:id',
  authorizePermission('authorizations', 'remove'),
  authorizationsController.remove,
)
