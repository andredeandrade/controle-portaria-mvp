export type DashboardPeriod = 'today' | 'last7days' | 'month'

export interface GetDashboardSummaryInput {
  condominiumId: string
  period: DashboardPeriod
}

export interface DashboardSummaryResponse {
  totalActiveAccesses: number
  totalAuthorizations: number
  totalEvents: number
}
