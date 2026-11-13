import type { Request, Response } from 'express'
import { HttpError } from '../../lib/http-error.js'
import { eventsService } from './events.service.js'
import type {
  CheckInEventGuestInput,
  CheckOutEventVehicleInput,
  CreateEventGuestInput,
  CreateEventVehicleInput,
  EventGuestInput,
  EventVehicleMovementType,
  RegisterEventAccessInput,
  UpdateEventInput,
} from './events.types.js'

function getBodyAsRecord(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== 'object') {
    throw new HttpError(400, 'Corpo da requisição inválido.')
  }

  return body as Record<string, unknown>
}

function readOptionalString(value: unknown): string | undefined {
  if (value === undefined) {
    return undefined
  }

  if (value === null) {
    return ''
  }

  return String(value)
}

function parseGuests(value: unknown): EventGuestInput[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((guest) => {
    if (!guest || typeof guest !== 'object') {
      return { name: '', document: '' }
    }

    const guestRecord = guest as Record<string, unknown>

    return {
      id: readOptionalString(guestRecord['id']) || undefined,
      name: String(guestRecord['name'] ?? ''),
      document: readOptionalString(guestRecord['document']),
    }
  })
}

function parseCreateVehicleInput(body: Record<string, unknown>): CreateEventVehicleInput {
  return {
    plate: String(body['plate'] ?? ''),
    brandModel: readOptionalString(body['brandModel']),
    driverName: readOptionalString(body['driverName']),
    driverDocument: readOptionalString(body['driverDocument']),
    color: readOptionalString(body['color']),
  }
}

function parseAddGuestInput(body: Record<string, unknown>): CreateEventGuestInput {
  return {
    name: String(body['name'] ?? ''),
    document: readOptionalString(body['document']),
  }
}

function parseCheckInGuestVehicle(
  value: unknown,
): { plate?: string; brandModel?: string; color?: string } | undefined {
  if (!value || typeof value !== 'object') {
    return undefined
  }

  const vehicleRecord = value as Record<string, unknown>

  return {
    plate: readOptionalString(vehicleRecord['plate']),
    brandModel: readOptionalString(vehicleRecord['brandModel']),
    color: readOptionalString(vehicleRecord['color']),
  }
}

function parseCheckInGuestInput(body: Record<string, unknown>): CheckInEventGuestInput {
  return {
    document: readOptionalString(body['document']),
    vehicle: parseCheckInGuestVehicle(body['vehicle']),
  }
}

function parseGuestIds(value: unknown): string[] | undefined {
  if (value === undefined) {
    return undefined
  }

  if (!Array.isArray(value)) {
    throw new HttpError(400, 'guestIds deve ser um array de identificadores.')
  }

  return value.map((guestId) => String(guestId ?? '').trim())
}

function parseCheckOutVehicleInput(body: Record<string, unknown>): CheckOutEventVehicleInput {
  return {
    guestIds: parseGuestIds(body['guestIds']),
  }
}

function parseRegisterAccessVehicle(value: unknown): RegisterEventAccessInput['vehicle'] {
  if (!value || typeof value !== 'object') {
    return undefined
  }

  const vehicleRecord = value as Record<string, unknown>

  return {
    driverName: readOptionalString(vehicleRecord['driverName']),
    driverDocument: readOptionalString(vehicleRecord['driverDocument']),
    plate: readOptionalString(vehicleRecord['plate']),
    brandModel: readOptionalString(vehicleRecord['brandModel']),
    color: readOptionalString(vehicleRecord['color']),
  }
}

function parseRegisterAccessGuests(value: unknown): RegisterEventAccessInput['guests'] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.map((guest) => {
    if (!guest || typeof guest !== 'object') {
      return { guestId: '', document: undefined }
    }

    const guestRecord = guest as Record<string, unknown>

    return {
      guestId: String(guestRecord['guestId'] ?? ''),
      document: readOptionalString(guestRecord['document']),
    }
  })
}

function parseRegisterAccessNewGuests(
  value: unknown,
): RegisterEventAccessInput['newGuests'] {
  if (!Array.isArray(value)) {
    return undefined
  }

  return value.map((guest) => {
    if (!guest || typeof guest !== 'object') {
      return { name: '', document: undefined }
    }

    const guestRecord = guest as Record<string, unknown>

    return {
      name: String(guestRecord['name'] ?? ''),
      document: readOptionalString(guestRecord['document']),
    }
  })
}

function parseRegisterAccessInput(body: Record<string, unknown>): RegisterEventAccessInput {
  return {
    movementType: String(body['movementType'] ?? '') as EventVehicleMovementType,
    vehicle: parseRegisterAccessVehicle(body['vehicle']),
    guests: parseRegisterAccessGuests(body['guests']),
    newGuests: parseRegisterAccessNewGuests(body['newGuests']),
  }
}

function parseUpdateInput(body: Record<string, unknown>): UpdateEventInput {
  const input: UpdateEventInput = {}

  if ('title' in body) {
    input.title = String(body['title'] ?? '')
  }

  if ('date' in body) {
    input.date = String(body['date'] ?? '')
  }

  if ('startTime' in body) {
    input.startTime = String(body['startTime'] ?? '')
  }

  if ('endTime' in body) {
    input.endTime = readOptionalString(body['endTime']) ?? null
  }

  if ('unit' in body) {
    input.unit = String(body['unit'] ?? '')
  }

  if ('space' in body) {
    input.space = readOptionalString(body['space']) ?? null
  }

  if ('responsibleName' in body) {
    input.responsibleName = String(body['responsibleName'] ?? '')
  }

  if ('guests' in body) {
    input.guests = parseGuests(body['guests'])
  }

  if ('observations' in body) {
    input.observations = readOptionalString(body['observations']) ?? null
  }

  return input
}

export const eventsController = {
  async create(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const body = getBodyAsRecord(req.body)

    const event = await eventsService.create({
      condominiumId: req.authUser.condominiumId,
      title: String(body['title'] ?? ''),
      date: String(body['date'] ?? ''),
      startTime: String(body['startTime'] ?? ''),
      endTime: readOptionalString(body['endTime']),
      unit: String(body['unit'] ?? ''),
      space: readOptionalString(body['space']),
      responsibleName: String(body['responsibleName'] ?? ''),
      guests: parseGuests(body['guests']),
      observations: readOptionalString(body['observations']),
      createdByUserId: req.authUser.id,
    })

    res.status(201).json(event)
  },

  async list(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const result = await eventsService.list({
      condominiumId: req.authUser.condominiumId,
      page: Number(req.query['page'] ?? 1),
      pageSize: Number(req.query['pageSize'] ?? 10),
      search: req.query['search'] ? String(req.query['search']) : undefined,
    })

    res.json(result)
  },

  async getById(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const event = await eventsService.getById(
      String(req.params['id'] ?? ''),
      req.authUser.condominiumId,
    )

    res.json(event)
  },

  async update(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const body = getBodyAsRecord(req.body)

    const event = await eventsService.update(
      String(req.params['id'] ?? ''),
      parseUpdateInput(body),
      req.authUser.condominiumId,
    )

    res.json(event)
  },

  async remove(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    await eventsService.remove(String(req.params['id'] ?? ''), req.authUser.condominiumId)

    res.status(204).send()
  },

  async checkInGuest(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const body = getBodyAsRecord(req.body)

    const event = await eventsService.checkInGuest(
      String(req.params['id'] ?? ''),
      String(req.params['guestId'] ?? ''),
      req.authUser.condominiumId,
      req.authUser.id,
      parseCheckInGuestInput(body),
    )

    res.json(event)
  },

  async checkOutGuest(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const event = await eventsService.checkOutGuest(
      String(req.params['id'] ?? ''),
      String(req.params['guestId'] ?? ''),
      req.authUser.condominiumId,
      req.authUser.id,
    )

    res.json(event)
  },

  async createVehicle(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const body = getBodyAsRecord(req.body)

    const event = await eventsService.createVehicle(
      String(req.params['id'] ?? ''),
      req.authUser.condominiumId,
      req.authUser.id,
      parseCreateVehicleInput(body),
    )

    res.status(201).json(event)
  },

  async checkOutVehicle(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const body = getBodyAsRecord(req.body)

    const event = await eventsService.checkOutVehicle(
      String(req.params['id'] ?? ''),
      String(req.params['vehicleId'] ?? ''),
      req.authUser.condominiumId,
      req.authUser.id,
      parseCheckOutVehicleInput(body),
    )

    res.json(event)
  },

  async registerAccess(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const body = getBodyAsRecord(req.body)

    const event = await eventsService.registerAccess(
      String(req.params['id'] ?? ''),
      req.authUser.condominiumId,
      req.authUser.id,
      parseRegisterAccessInput(body),
    )

    res.status(201).json(event)
  },

  async addGuest(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const body = getBodyAsRecord(req.body)

    const event = await eventsService.addGuest(
      String(req.params['id'] ?? ''),
      req.authUser.condominiumId,
      parseAddGuestInput(body),
    )

    res.status(201).json(event)
  },

  async deleteVehicle(req: Request, res: Response) {
    if (!req.authUser) {
      throw new HttpError(401, 'Não autenticado.')
    }

    const event = await eventsService.deleteVehicle(
      String(req.params['id'] ?? ''),
      String(req.params['vehicleId'] ?? ''),
      req.authUser.condominiumId,
    )

    res.json(event)
  },
}
