import { Router } from 'express'
import { accessRecordsRouter } from '../modules/access-records/index.js'
import { authorizationsRouter } from '../modules/authorizations/index.js'
import { authRouter } from '../modules/auth/index.js'
import { condominiumsRouter } from '../modules/condominiums/index.js'
import { dashboardRouter } from '../modules/dashboard/index.js'
import { eventsRouter } from '../modules/events/index.js'
import { incidentsRouter } from '../modules/incidents/index.js'
import { reportsRouter } from '../modules/reports/index.js'
import { residentsRouter } from '../modules/residents/index.js'
import { serviceProvidersRouter } from '../modules/service-providers/index.js'
import { visitorsRouter } from '../modules/visitors/index.js'

export const router = Router()

router.use('/condominiums', condominiumsRouter)
router.use('/auth', authRouter)
router.use('/access-records', accessRecordsRouter)
router.use('/authorizations', authorizationsRouter)
router.use('/dashboard', dashboardRouter)
router.use('/events', eventsRouter)
router.use('/incidents', incidentsRouter)
router.use('/reports', reportsRouter)
router.use('/residents', residentsRouter)
router.use('/visitors', visitorsRouter)
router.use('/service-providers', serviceProvidersRouter)
