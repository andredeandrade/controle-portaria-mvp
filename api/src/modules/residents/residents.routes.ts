import { Router } from 'express'
import { authenticate } from '../../middlewares/authenticate.js'
import { authorizePermission } from '../../middlewares/authorize.js'
import { residentsController } from './residents.controller.js'

export const residentsRouter = Router()

residentsRouter.use(authenticate)

residentsRouter.post('/', authorizePermission('residents', 'create'), residentsController.create)
residentsRouter.get('/', authorizePermission('residents', 'view'), residentsController.list)
residentsRouter.get(
  '/:id',
  authorizePermission('residents', 'view'),
  residentsController.getById,
)
residentsRouter.patch(
  '/:id',
  authorizePermission('residents', 'update'),
  residentsController.update,
)
residentsRouter.delete(
  '/:id',
  authorizePermission('residents', 'remove'),
  residentsController.remove,
)
