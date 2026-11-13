import { Router } from 'express'
import { authenticate } from '../../middlewares/authenticate.js'
import { authorizePermission } from '../../middlewares/authorize.js'
import { reportsController } from './reports.controller.js'

export const reportsRouter = Router()

reportsRouter.use(authenticate)
reportsRouter.use(authorizePermission('reports', 'view'))

reportsRouter.get('/dashboard-summary', reportsController.getDashboardSummary)
reportsRouter.get('/accesses', reportsController.listAccessReport)
reportsRouter.get('/visitors', reportsController.listVisitorsReport)
reportsRouter.get('/service-providers', reportsController.listServiceProvidersReport)
reportsRouter.get('/incidents', reportsController.listIncidentsReport)
reportsRouter.get('/residents', reportsController.listResidentsReport)
reportsRouter.get('/events', reportsController.listEventsReport)
reportsRouter.get('/authorizations', reportsController.listAuthorizationsReport)
