import { Router } from 'express'
import { authenticate } from '../../middlewares/authenticate.js'
import { authorizePermission } from '../../middlewares/authorize.js'
import { accessRecordsController } from './access-records.controller.js'

export const accessRecordsRouter = Router()

accessRecordsRouter.use(authenticate)

accessRecordsRouter.post(
  '/check-in',
  authorizePermission('access-records', 'checkIn'),
  accessRecordsController.checkIn,
)
accessRecordsRouter.post(
  '/:id/check-out',
  authorizePermission('access-records', 'checkOut'),
  accessRecordsController.checkOut,
)
accessRecordsRouter.get(
  '/',
  authorizePermission('access-records', 'view'),
  accessRecordsController.list,
)
accessRecordsRouter.get(
  '/:id',
  authorizePermission('access-records', 'view'),
  accessRecordsController.getById,
)
