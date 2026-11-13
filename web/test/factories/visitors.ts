import type { Visitor, VisitorsListResponse } from '@/app/api/visitors/types'

/** Visitante fictício no formato devolvido pelo BFF `/api/visitors`. */
export function buildVisitor(overrides: Partial<Visitor> = {}): Visitor {
  return {
    id: 'visitante-1',
    fullName: 'Joana Fictícia',
    document: '12345678',
    phone: '(11) 90000-0000',
    email: null,
    unit: 'Bloco A - 101',
    authorizedBy: 'Morador Fictício',
    observations: null,
    vehiclePlate: null,
    vehicleBrandModel: null,
    vehicleColor: null,
    createdByUserId: 'usuario-1',
    createdAt: '2026-01-10T12:00:00.000Z',
    updatedAt: '2026-01-10T12:00:00.000Z',
    ...overrides,
  }
}

export function buildVisitorsPage(
  items: Visitor[],
  pagination: Partial<VisitorsListResponse['pagination']> = {},
): VisitorsListResponse {
  return {
    items,
    pagination: { page: 1, pageSize: 10, total: items.length, totalPages: 1, ...pagination },
  }
}
