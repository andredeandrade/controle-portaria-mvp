import type { Request, Response } from 'express'
import { HttpError } from '../../lib/http-error.js'
import { reportsService } from './reports.service.js'
import type { AccessReportStatus, DashboardSummaryPeriod } from './reports.types.js'

interface ParsedRange {
  startDate: Date
  endDate: Date
}

function asSingleQueryValue(value: unknown): string | undefined {
  if (value === undefined) {
    return undefined
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? String(value[0]) : undefined
  }

  return String(value)
}

function parseDateOnly(value: string, fieldName: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    throw new HttpError(400, `${fieldName} inválido. Use o formato YYYY-MM-DD.`)
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  const date = new Date(year, month - 1, day)

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new HttpError(400, `${fieldName} inválido.`)
  }

  return date
}

function parseMonthOnly(value: string): ParsedRange {
  const match = /^(\d{4})-(\d{2})$/.exec(value)

  if (!match) {
    throw new HttpError(400, 'month inválido. Use o formato YYYY-MM.')
  }

  const year = Number(match[1])
  const month = Number(match[2])

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new HttpError(400, 'month inválido.')
  }

  const startDate = new Date(year, month - 1, 1)
  startDate.setHours(0, 0, 0, 0)

  const endDate = new Date(year, month, 0)
  endDate.setHours(23, 59, 59, 999)

  return { startDate, endDate }
}

function parseCustomRange(req: Request): ParsedRange | undefined {
  const day = asSingleQueryValue(req.query['day'])
  const month = asSingleQueryValue(req.query['month'])
  const from = asSingleQueryValue(req.query['from'])
  const to = asSingleQueryValue(req.query['to'])

  const customFiltersCount = [day, month, from || to ? 'range' : undefined].filter(Boolean).length

  if (customFiltersCount > 1) {
    throw new HttpError(400, 'Use apenas um filtro: day, month ou from/to.')
  }

  if (day) {
    const startDate = parseDateOnly(day, 'day')
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(startDate)
    endDate.setHours(23, 59, 59, 999)

    return { startDate, endDate }
  }

  if (month) {
    return parseMonthOnly(month)
  }

  if (from || to) {
    if (!from || !to) {
      throw new HttpError(400, 'Informe from e to juntos no formato YYYY-MM-DD.')
    }

    const startDate = parseDateOnly(from, 'from')
    startDate.setHours(0, 0, 0, 0)

    const endDate = parseDateOnly(to, 'to')
    endDate.setHours(23, 59, 59, 999)

    if (startDate > endDate) {
      throw new HttpError(400, 'from não pode ser maior que to.')
    }

    return { startDate, endDate }
  }

  return undefined
}

function parsePeriod(value: unknown): DashboardSummaryPeriod | undefined {
  if (value === undefined) {
    return undefined
  }

  const rawValue = Array.isArray(value) ? value[0] : value

  if (rawValue === 'day' || rawValue === 'week' || rawValue === 'month') {
    return rawValue
  }

  throw new HttpError(400, 'Período inválido. Use day, week ou month.')
}

function getStartOfWeek(date: Date): Date {
  const baseDate = new Date(date)
  const day = baseDate.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day

  baseDate.setDate(baseDate.getDate() + diffToMonday)
  baseDate.setHours(0, 0, 0, 0)

  return baseDate
}

function getRangeFromPeriod(period: DashboardSummaryPeriod | undefined): ParsedRange | undefined {
  if (!period) {
    return undefined
  }

  const now = new Date()

  if (period === 'day') {
    const startDate = new Date(now)
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date(now)
    endDate.setHours(23, 59, 59, 999)

    return { startDate, endDate }
  }

  if (period === 'week') {
    const startDate = getStartOfWeek(now)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 6)
    endDate.setHours(23, 59, 59, 999)

    return { startDate, endDate }
  }

  const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  startDate.setHours(0, 0, 0, 0)

  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  endDate.setHours(23, 59, 59, 999)

  return { startDate, endDate }
}

function parsePositiveInteger(value: unknown, fieldName: string, fallback: number): number {
  if (value === undefined) {
    return fallback
  }

  const numericValue = Number(Array.isArray(value) ? value[0] : value)

  if (!Number.isInteger(numericValue) || numericValue < 1) {
    throw new HttpError(400, `${fieldName} inválido.`)
  }

  return numericValue
}

function parseAccessStatus(value: unknown): AccessReportStatus | undefined {
  if (value === undefined) {
    return undefined
  }

  const rawValue = Array.isArray(value) ? value[0] : value

  if (rawValue === 'all' || rawValue === 'open' || rawValue === 'closed') {
    return rawValue
  }

  throw new HttpError(400, 'Status inválido. Use all, open ou closed.')
}

function parseOptionalString(value: unknown): string | undefined {
  const rawValue = asSingleQueryValue(value)

  if (rawValue === undefined) {
    return undefined
  }

  const trimmed = rawValue.trim()
  return trimmed ? trimmed : undefined
}

export const reportsController = {
  async getDashboardSummary(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const customRange = parseCustomRange(req)
    const period = parsePeriod(req.query['period'])

    if (customRange && period) {
      throw new HttpError(400, 'Não combine period com day, month ou from/to.')
    }

    const summary = await reportsService.getDashboardSummary({
      condominiumId: req.authUser.condominiumId,
      period,
      startDate: customRange?.startDate,
      endDate: customRange?.endDate,
    })

    res.json(summary)
  },

  async listAccessReport(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const customRange = parseCustomRange(req)
    const period = parsePeriod(req.query['period'])

    if (customRange && period) {
      throw new HttpError(400, 'Não combine period com day, month ou from/to.')
    }

    const periodRange = getRangeFromPeriod(period)

    const result = await reportsService.listAccessReport({
      condominiumId: req.authUser.condominiumId,
      page: parsePositiveInteger(req.query['page'], 'Parâmetro page', 1),
      pageSize: parsePositiveInteger(req.query['pageSize'], 'Parâmetro pageSize', 10),
      status: parseAccessStatus(req.query['status']),
      startDate: customRange?.startDate ?? periodRange?.startDate,
      endDate: customRange?.endDate ?? periodRange?.endDate,
      visitor: parseOptionalString(req.query['visitor']),
      serviceProvider: parseOptionalString(req.query['serviceProvider']),
      resident: parseOptionalString(req.query['resident']),
      responsibleUserId: parseOptionalString(req.query['responsibleUserId']),
    })

    res.json(result)
  },

  async listVisitorsReport(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const customRange = parseCustomRange(req)
    const period = parsePeriod(req.query['period'])

    if (customRange && period) {
      throw new HttpError(400, 'Não combine period com day, month ou from/to.')
    }

    const condominiumIdFilter = parseOptionalString(req.query['condominiumId'])

    if (condominiumIdFilter && condominiumIdFilter !== req.authUser.condominiumId) {
      throw new HttpError(403, 'Filtro condominiumId não permitido para o usuário autenticado.')
    }

    const periodRange = getRangeFromPeriod(period)

    const result = await reportsService.listVisitorsReport({
      condominiumId: req.authUser.condominiumId,
      page: parsePositiveInteger(req.query['page'], 'Parâmetro page', 1),
      pageSize: parsePositiveInteger(req.query['pageSize'], 'Parâmetro pageSize', 10),
      name: parseOptionalString(req.query['name']),
      document: parseOptionalString(req.query['document']),
      startDate: customRange?.startDate ?? periodRange?.startDate,
      endDate: customRange?.endDate ?? periodRange?.endDate,
    })

    res.json(result)
  },

  async listServiceProvidersReport(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const customRange = parseCustomRange(req)
    const period = parsePeriod(req.query['period'])

    if (customRange && period) {
      throw new HttpError(400, 'Não combine period com day, month ou from/to.')
    }

    const periodRange = getRangeFromPeriod(period)

    const result = await reportsService.listServiceProvidersReport({
      condominiumId: req.authUser.condominiumId,
      page: parsePositiveInteger(req.query['page'], 'Parâmetro page', 1),
      pageSize: parsePositiveInteger(req.query['pageSize'], 'Parâmetro pageSize', 10),
      name: parseOptionalString(req.query['name']),
      document: parseOptionalString(req.query['document']),
      category: parseOptionalString(req.query['category']),
      startDate: customRange?.startDate ?? periodRange?.startDate,
      endDate: customRange?.endDate ?? periodRange?.endDate,
    })

    res.json(result)
  },

  async listIncidentsReport(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const customRange = parseCustomRange(req)
    const period = parsePeriod(req.query['period'])

    if (customRange && period) {
      throw new HttpError(400, 'Não combine period com day, month ou from/to.')
    }

    const periodRange = getRangeFromPeriod(period)

    const result = await reportsService.listIncidentsReport({
      condominiumId: req.authUser.condominiumId,
      page: parsePositiveInteger(req.query['page'], 'Parâmetro page', 1),
      pageSize: parsePositiveInteger(req.query['pageSize'], 'Parâmetro pageSize', 10),
      status: parseOptionalString(req.query['status']),
      priority: parseOptionalString(req.query['priority']),
      responsibleUserId: parseOptionalString(req.query['responsibleUserId']),
      startDate: customRange?.startDate ?? periodRange?.startDate,
      endDate: customRange?.endDate ?? periodRange?.endDate,
    })

    res.json(result)
  },

  async listResidentsReport(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const customRange = parseCustomRange(req)
    const period = parsePeriod(req.query['period'])

    if (customRange && period) {
      throw new HttpError(400, 'Não combine period com day, month ou from/to.')
    }

    const periodRange = getRangeFromPeriod(period)

    const result = await reportsService.listResidentsReport({
      condominiumId: req.authUser.condominiumId,
      page: parsePositiveInteger(req.query['page'], 'Parâmetro page', 1),
      pageSize: parsePositiveInteger(req.query['pageSize'], 'Parâmetro pageSize', 10),
      startDate: customRange?.startDate ?? periodRange?.startDate,
      endDate: customRange?.endDate ?? periodRange?.endDate,
    })

    res.json(result)
  },

  async listEventsReport(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const customRange = parseCustomRange(req)
    const period = parsePeriod(req.query['period'])

    if (customRange && period) {
      throw new HttpError(400, 'Não combine period com day, month ou from/to.')
    }

    const periodRange = getRangeFromPeriod(period)

    const result = await reportsService.listEventsReport({
      condominiumId: req.authUser.condominiumId,
      page: parsePositiveInteger(req.query['page'], 'Parâmetro page', 1),
      pageSize: parsePositiveInteger(req.query['pageSize'], 'Parâmetro pageSize', 10),
      startDate: customRange?.startDate ?? periodRange?.startDate,
      endDate: customRange?.endDate ?? periodRange?.endDate,
    })

    res.json(result)
  },

  async listAuthorizationsReport(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const customRange = parseCustomRange(req)
    const period = parsePeriod(req.query['period'])

    if (customRange && period) {
      throw new HttpError(400, 'Não combine period com day, month ou from/to.')
    }

    const periodRange = getRangeFromPeriod(period)

    const result = await reportsService.listAuthorizationsReport({
      condominiumId: req.authUser.condominiumId,
      page: parsePositiveInteger(req.query['page'], 'Parâmetro page', 1),
      pageSize: parsePositiveInteger(req.query['pageSize'], 'Parâmetro pageSize', 10),
      startDate: customRange?.startDate ?? periodRange?.startDate,
      endDate: customRange?.endDate ?? periodRange?.endDate,
    })

    res.json(result)
  },
}
