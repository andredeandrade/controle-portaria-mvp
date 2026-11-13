'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import type { Authorization } from '@/app/api/authorizations/types'
import type { Resident } from '@/app/api/residents/types'
import type { ServiceProvider } from '@/app/api/service-providers/types'
import type { Visitor } from '@/app/api/visitors/types'
import { PERSON_TYPE_LABEL } from '@/types/autorizacoes'
import {
  type AccessPersonTypeValue,
  COLOR_OPTIONS,
  type ColorValue,
  type LocomotionValue,
  type PersonTypeValue,
} from '@/modules/form'
import { listAuthorizations } from '@/services/autorizacoes/service'
import { listResidents } from '@/services/moradores/service'
import { listServiceProviders } from '@/services/prestadores-servicos/service'
import { listVisitors } from '@/services/visitantes/service'

export type PersonSearchOption = {
  /** Chave única da opção (um morador com várias unidades gera uma opção por unidade). */
  key: string
  id: string
  category: AccessPersonTypeValue
  /** Tipo de pessoa da autorizacao (ex.: Visitante), exibido como selo na busca. */
  badge: string | null
  name: string
  document: string
  unit: string
  locomotion: LocomotionValue
  color: ColorValue | ''
  plate: string
  brandModel: string
  companyName: string | null
}

function normalizeText(value: string) {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()
}

/**
 * Converte uma cor em texto livre (ex.: "Prata", "preto") para o valor do
 * `ColorSelect`. Cores nao reconhecidas viram `outra_cor`.
 */
function toColorValue(color: string | null | undefined): ColorValue | '' {
  if (!color?.trim()) {
    return ''
  }

  const normalizedColor = normalizeText(color)
  const match = COLOR_OPTIONS.find(
    (option) => option.value === normalizedColor || normalizeText(option.label) === normalizedColor,
  )

  return match?.value ?? 'outra_cor'
}

type VehicleData = {
  plate: string | null
  brandModel: string | null
  color: string | null
}

function mapVehicleFields(vehicle: VehicleData, type: LocomotionValue | null) {
  const hasVehicle = Boolean(vehicle.plate || vehicle.brandModel || vehicle.color)

  return {
    locomotion: type ?? (hasVehicle ? 'carro' : 'a_pe'),
    color: toColorValue(vehicle.color),
    plate: vehicle.plate ?? '',
    brandModel: vehicle.brandModel ?? '',
  } satisfies Pick<PersonSearchOption, 'locomotion' | 'color' | 'plate' | 'brandModel'>
}

/** Gera uma opção por unidade do morador, para o porteiro escolher o destino. */
function mapResident(resident: Resident): PersonSearchOption[] {
  const vehicle = resident.vehicles[0]
  const units = resident.units.length > 0 ? resident.units : ['']

  return units.map((unit) => ({
    key: `${resident.id}:${unit}`,
    id: resident.id,
    badge: null,
    category: 'morador',
    name: resident.fullName,
    document: resident.document ?? '',
    unit,
    ...mapVehicleFields(
      {
        plate: vehicle?.plate ?? null,
        brandModel: vehicle?.brandModel ?? null,
        color: vehicle?.color ?? null,
      },
      vehicle?.type ?? null,
    ),
    companyName: null,
  }))
}

function mapVisitor(visitor: Visitor): PersonSearchOption {
  return {
    key: visitor.id,
    id: visitor.id,
    badge: null,
    category: 'visitante',
    name: visitor.fullName,
    document: visitor.document ?? '',
    unit: visitor.unit,
    ...mapVehicleFields(
      {
        plate: visitor.vehiclePlate,
        brandModel: visitor.vehicleBrandModel,
        color: visitor.vehicleColor,
      },
      null,
    ),
    companyName: null,
  }
}

function mapServiceProvider(serviceProvider: ServiceProvider): PersonSearchOption {
  return {
    key: serviceProvider.id,
    id: serviceProvider.id,
    badge: null,
    category: 'prestador_servico',
    name: serviceProvider.responsibleName,
    document: serviceProvider.document ?? '',
    unit: serviceProvider.unit ?? '',
    ...mapVehicleFields(
      {
        plate: serviceProvider.vehiclePlate,
        brandModel: serviceProvider.vehicleBrandModel,
        color: serviceProvider.vehicleColor,
      },
      null,
    ),
    companyName: serviceProvider.companyName,
  }
}

function mapAuthorization(authorization: Authorization): PersonSearchOption {
  return {
    key: authorization.id,
    id: authorization.id,
    category: 'autorizado',
    badge:
      PERSON_TYPE_LABEL[authorization.personType as PersonTypeValue] ?? authorization.personType,
    name: authorization.authorizedName,
    document: authorization.document ?? '',
    unit: authorization.unit,
    ...mapVehicleFields({ plate: null, brandModel: null, color: null }, null),
    companyName: authorization.company,
  }
}

async function searchPeople(category: AccessPersonTypeValue, searchTerm: string) {
  if (category === 'morador') {
    const response = await listResidents(1, 10, searchTerm)
    return response.items.flatMap(mapResident)
  }

  if (category === 'visitante') {
    const response = await listVisitors(1, 10, searchTerm)
    return response.items.map(mapVisitor)
  }

  if (category === 'autorizado') {
    const response = await listAuthorizations(1, 10, searchTerm)
    return response.items.map(mapAuthorization)
  }

  const response = await listServiceProviders(1, 10, searchTerm)
  return response.items.map(mapServiceProvider)
}

/**
 * Busca cadastros (morador/visitante/prestador de servico) ou autorizacoes
 * por nome/unidade, conforme a categoria escolhida, para autopreenchimento no
 * formulario de registro de acesso.
 */
export function usePersonSearch(category: AccessPersonTypeValue | '', searchTerm: string) {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim())
    }, 350)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [searchTerm])

  const isEnabled = category !== '' && debouncedSearchTerm.length >= 2

  const searchQuery = useQuery({
    queryKey: ['person-search', category, debouncedSearchTerm],
    queryFn: async () => {
      if (category === '') {
        return []
      }

      return searchPeople(category, debouncedSearchTerm)
    },
    enabled: isEnabled,
    placeholderData: keepPreviousData,
  })

  return {
    options: searchQuery.data ?? [],
    isFetching: searchQuery.isFetching,
    isError: searchQuery.isError,
  }
}
