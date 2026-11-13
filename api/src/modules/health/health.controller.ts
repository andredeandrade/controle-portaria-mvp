import type { Request, Response } from 'express'
import { healthService } from './health.service.js'

export const healthController = {
  /** Liveness: o processo está de pé e atendendo HTTP. Não toca no banco. */
  live(_req: Request, res: Response) {
    res.json({ status: 'ok' })
  },

  /** Readiness: além de estar de pé, o banco responde. 503 se não responder. */
  async ready(_req: Request, res: Response) {
    const databaseOk = await healthService.isDatabaseReachable()

    res
      .status(databaseOk ? 200 : 503)
      .json({ status: databaseOk ? 'ok' : 'error', database: databaseOk ? 'ok' : 'unreachable' })
  },
}
