import { Router } from 'express'
import { authenticate } from '../../middlewares/authenticate.js'
import { authorizePermission } from '../../middlewares/authorize.js'
import { eventsController } from './events.controller.js'

export const eventsRouter = Router()

eventsRouter.use(authenticate)

eventsRouter.post('/', authorizePermission('events', 'create'), eventsController.create)
eventsRouter.get('/', authorizePermission('events', 'view'), eventsController.list)
eventsRouter.get('/:id', authorizePermission('events', 'view'), eventsController.getById)
eventsRouter.patch('/:id', authorizePermission('events', 'update'), eventsController.update)
eventsRouter.delete('/:id', authorizePermission('events', 'remove'), eventsController.remove)
eventsRouter.post(
  '/:id/guests/:guestId/check-in',
  authorizePermission('events', 'registerAccess'),
  eventsController.checkInGuest,
)
eventsRouter.post(
  '/:id/guests/:guestId/check-out',
  authorizePermission('events', 'registerAccess'),
  eventsController.checkOutGuest,
)
eventsRouter.post(
  '/:id/guests',
  authorizePermission('events', 'addGuest'),
  eventsController.addGuest,
)
eventsRouter.post(
  '/:id/vehicles',
  authorizePermission('events', 'registerAccess'),
  eventsController.createVehicle,
)
eventsRouter.post(
  '/:id/vehicles/:vehicleId/check-out',
  authorizePermission('events', 'registerAccess'),
  eventsController.checkOutVehicle,
)
eventsRouter.delete(
  '/:id/vehicles/:vehicleId',
  authorizePermission('events', 'registerAccess'),
  eventsController.deleteVehicle,
)
eventsRouter.post(
  '/:id/access',
  authorizePermission('events', 'registerAccess'),
  eventsController.registerAccess,
)
