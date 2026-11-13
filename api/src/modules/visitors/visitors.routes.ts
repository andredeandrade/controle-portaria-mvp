import { Router } from 'express'
import { authenticate } from '../../middlewares/authenticate.js'
import { authorizePermission } from '../../middlewares/authorize.js'
import { visitorsController } from './visitors.controller.js'

export const visitorsRouter = Router()

visitorsRouter.use(authenticate)

visitorsRouter.post('/', authorizePermission('visitors', 'create'), visitorsController.create)
visitorsRouter.get('/', authorizePermission('visitors', 'view'), visitorsController.list)
visitorsRouter.get('/:id', authorizePermission('visitors', 'view'), visitorsController.getById)
visitorsRouter.patch(
  '/:id',
  authorizePermission('visitors', 'update'),
  visitorsController.update,
)
visitorsRouter.delete(
  '/:id',
  authorizePermission('visitors', 'remove'),
  visitorsController.remove,
)
