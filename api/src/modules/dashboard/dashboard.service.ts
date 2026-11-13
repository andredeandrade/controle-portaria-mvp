import { prisma } from '../../lib/prisma.js'
import type {
  DashboardPeriod,
  DashboardSummaryResponse,
  GetDashboardSummaryInput,
} from './dashboard.types.js'

function toDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getPeriodDateRange(period: DashboardPeriod): { startDate: string; endDate: string } {
  const now = new Date()
  const todayStr = toDateString(now)

  if (period === 'today') {
    return { startDate: todayStr, endDate: todayStr }
  }

  if (period === 'last7days') {
    const start = new Date(now)
    start.setDate(start.getDate() - 6)
    return { startDate: toDateString(start), endDate: todayStr }
  }

  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return { startDate: toDateString(start), endDate: toDateString(end) }
}

export const dashboardService = {
  async getSummary(input: GetDashboardSummaryInput): Promise<DashboardSummaryResponse> {
    const { condominiumId, period } = input
    const { startDate, endDate } = getPeriodDateRange(period)

    const [totalActiveAccesses, totalEvents, totalAuthorizations] = await prisma.$transaction([
      prisma.accessRecord.count({ where: { condominiumId, checkOutAt: null } }),
      prisma.event.count({ where: { condominiumId, date: { gte: startDate, lte: endDate } } }),
      prisma.authorization.count({
        where: {
          condominiumId,
          validFromDate: { lte: endDate },
          validToDate: { gte: startDate },
        },
      }),
    ])

    return { totalActiveAccesses, totalEvents, totalAuthorizations }
  },
}
