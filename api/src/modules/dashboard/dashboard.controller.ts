import type { Request, Response } from 'express'
import { HttpError } from '../../lib/http-error.js'
import { dashboardService } from './dashboard.service.js'
import type { DashboardPeriod } from './dashboard.types.js'

function parsePeriod(value: unknown): DashboardPeriod {
  const rawValue = Array.isArray(value) ? value[0] : value

  if (rawValue === 'today' || rawValue === 'last7days' || rawValue === 'month') {
    return rawValue
  }

  throw new HttpError(400, 'Período inválido. Use today, last7days ou month.')
}

export const dashboardController = {
  async getSummary(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const summary = await dashboardService.getSummary({
      condominiumId: req.authUser.condominiumId,
      period: parsePeriod(req.query['period']),
    })

    res.json(summary)
  },
}
