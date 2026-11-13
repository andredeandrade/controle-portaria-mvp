import { Router } from 'express'
import { authenticate } from '../../middlewares/authenticate.js'
import { dashboardController } from './dashboard.controller.js'

export const dashboardRouter = Router()

dashboardRouter.use(authenticate)
dashboardRouter.get('/summary', dashboardController.getSummary)
