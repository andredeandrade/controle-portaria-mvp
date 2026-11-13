import { Router } from 'express'
import { authenticate } from '../../middlewares/authenticate.js'
import { authorizeRoles } from '../../middlewares/authorize.js'
import { requirePlatformSecret } from '../../middlewares/platform-secret.js'
import { condominiumsController } from './condominiums.controller.js'

export const condominiumsRouter = Router()

condominiumsRouter.post('/', requirePlatformSecret, condominiumsController.create)
condominiumsRouter.get('/slug/:slug/id', condominiumsController.getIdBySlug)
condominiumsRouter.get('/me', authenticate, condominiumsController.me)
condominiumsRouter.patch(
  '/me',
  authenticate,
  authorizeRoles('ADMIN'),
  condominiumsController.updateMe,
)
