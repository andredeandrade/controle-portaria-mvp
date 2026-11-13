'use client'

import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MuiCard from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import { alpha, useTheme } from '@mui/material/styles'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useState } from 'react'

import type { Event, EventVehicle, EventVehicleMovementType } from '@/app/api/events/types'
import { useCan } from '@/hooks/useCan'
import {
  EventCheckOutDialog,
  type EventCheckOutTarget,
} from '@/modules/eventos/components/EventCheckOutDialog'
import { EventVehicleDetailsDialog } from '@/modules/eventos/components/EventVehicleDetailsDialog'
import { EventVehicleMovementBadge } from '@/modules/eventos/components/EventVehicleMovementBadge'
import { Table } from '@/modules/table/components/Table'
import { TableBody } from '@/modules/table/components/TableBody'
import { TableCell } from '@/modules/table/components/TableCell'
import { TableHead } from '@/modules/table/components/TableHead'
import { TableHeadCell } from '@/modules/table/components/TableHeadCell'
import { TableRow } from '@/modules/table/components/TableRow'
import { ListSearchField } from '@/modules/table/components/ListSearchField'
import { MobileFieldLabel, MobileListCard } from '@/styles/MobileList.styles'

const COLUMN_COUNT = 6

type MovementFilter = 'todos' | EventVehicleMovementType

const MOVEMENT_FILTER_LABEL: Record<MovementFilter, string> = {
  todos: 'Todos',
  CONVIDADO: 'Convidado',
  DESEMBARQUE: 'Desembarque',
  BUSCA: 'Busca de convidado',
}

const MOVEMENT_FILTER_PALETTE: Record<MovementFilter, 'primary' | 'info' | 'warning'> = {
  todos: 'primary',
  CONVIDADO: 'primary',
  DESEMBARQUE: 'info',
  BUSCA: 'warning',
}

function formatTime(iso: string | null): string {
  if (!iso) {
    return '—'
  }

  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function matchesSearch(vehicle: EventVehicle, searchTerm: string): boolean {
  const normalizedSearch = searchTerm.trim().toLowerCase()

  if (!normalizedSearch) {
    return true
  }

  const plate = vehicle.plate?.toLowerCase() ?? ''
  const brandModel = vehicle.brandModel?.toLowerCase() ?? ''
  const driverName = vehicle.driverName?.toLowerCase() ?? ''

  return (
    plate.includes(normalizedSearch) ||
    brandModel.includes(normalizedSearch) ||
    driverName.includes(normalizedSearch)
  )
}

type EventVehiclesCardProps = {
  event: Event
}

export function EventVehiclesCard({ event }: EventVehiclesCardProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [searchTerm, setSearchTerm] = useState('')
  const [movementFilter, setMovementFilter] = useState<MovementFilter>('todos')
  const [onlyOpen, setOnlyOpen] = useState(false)
  const [viewedVehicleId, setViewedVehicleId] = useState<string | null>(null)
  const [checkOutTarget, setCheckOutTarget] = useState<EventCheckOutTarget | null>(null)
  const canRegisterAccess = useCan('events', 'registerAccess')

  const vehiclesCount = event.vehicles.length
  const openCount = event.vehicles.filter((vehicle) => vehicle.isOpen).length

  const handleMovementFilterChange = (filter: MovementFilter) => {
    setMovementFilter(filter)
    setOnlyOpen(false)
  }

  const handleOnlyOpenToggle = () => {
    setOnlyOpen((current) => !current)
    setMovementFilter('todos')
  }

  const filteredVehicles = event.vehicles.filter((vehicle) => {
    if (!matchesSearch(vehicle, searchTerm)) {
      return false
    }

    if (onlyOpen) {
      return vehicle.isOpen
    }

    if (movementFilter !== 'todos' && vehicle.movementType !== movementFilter) {
      return false
    }

    return true
  })

  const viewedVehicle = event.vehicles.find((vehicle) => vehicle.id === viewedVehicleId) ?? null

  const emptyMessage =
    vehiclesCount === 0
      ? 'Nenhum veículo registrado. Veículos entram no evento pela tela "Registrar acesso".'
      : 'Nenhum veículo corresponde ao filtro selecionado.'

  const renderAction = (vehicle: EventVehicle) => (
    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
      <Tooltip title="Visualizar">
        <IconButton
          aria-label={`Visualizar veículo ${vehicle.plate ?? ''}`}
          size="small"
          onClick={() => setViewedVehicleId(vehicle.id)}
        >
          <VisibilityRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {canRegisterAccess && vehicle.isOpen ? (
        <Tooltip title="Registrar saída">
          <IconButton
            aria-label={`Registrar saída do veículo ${vehicle.plate ?? ''}`}
            size="small"
            color="warning"
            onClick={() => setCheckOutTarget({ type: 'vehicle', vehicleId: vehicle.id })}
          >
            <LogoutRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : null}
    </Stack>
  )

  return (
    <MuiCard>
      <CardContent>
        <Stack spacing={3.5}>
          <Stack direction="row" spacing={2} alignItems="center">
            <DirectionsCarRoundedIcon color="primary" fontSize="small" />
            <Typography variant="h4">Veículos</Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {`${openCount} no local · ${vehiclesCount - openCount} com saída registrada`}
          </Typography>

          <ListSearchField
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por placa, modelo ou motorista..."
            sx={{ width: '100%', maxWidth: 420 }}
          />

          <Stack
            direction="row"
            spacing={1}
            sx={{
              flexWrap: { xs: 'nowrap', sm: 'wrap' },
              rowGap: 1,
              overflowX: { xs: 'auto', sm: 'visible' },
              pb: { xs: 0.5, sm: 0 },
            }}
          >
            {(['todos', 'CONVIDADO', 'DESEMBARQUE', 'BUSCA'] as MovementFilter[]).map((filter) => {
              const isActive = !onlyOpen && movementFilter === filter
              const paletteKey = MOVEMENT_FILTER_PALETTE[filter]
              const dotColor = theme.palette[paletteKey].main

              return (
                <Box
                  key={filter}
                  onClick={() => handleMovementFilterChange(filter)}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    padding: '6px 14px',
                    borderRadius: 999,
                    border: '1px solid',
                    borderColor: isActive ? dotColor : 'divider',
                    backgroundColor: isActive ? alpha(dotColor, 0.16) : 'transparent',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: dotColor,
                    }}
                  />
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ color: isActive ? dotColor : 'text.secondary' }}
                  >
                    {MOVEMENT_FILTER_LABEL[filter]}
                  </Typography>
                </Box>
              )
            })}

            <Box
              onClick={handleOnlyOpenToggle}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                padding: '6px 14px',
                borderRadius: 999,
                border: '1px solid',
                borderColor: onlyOpen ? 'success.main' : 'divider',
                backgroundColor: onlyOpen ? alpha(theme.palette.success.main, 0.16) : 'transparent',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <PlaceRoundedIcon
                fontSize="small"
                sx={{ color: onlyOpen ? 'success.main' : 'text.secondary' }}
              />
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ color: onlyOpen ? 'success.main' : 'text.secondary' }}
              >
                Somente no local
              </Typography>
            </Box>
          </Stack>

          {isMobile ? (
            filteredVehicles.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {emptyMessage}
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {filteredVehicles.map((vehicle) => (
                  <MobileListCard key={vehicle.id} variant="outlined">
                    <Stack spacing={3}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Stack spacing={0.25}>
                          <Typography variant="body2" fontWeight={700} color="text.primary">
                            {vehicle.plate ?? '—'}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {vehicle.brandModel ?? '—'}
                          </Typography>
                        </Stack>

                        <EventVehicleMovementBadge movementType={vehicle.movementType} />
                      </Stack>

                      <Divider sx={{ borderColor: 'divider' }} />

                      <Stack direction="row">
                        <Stack spacing={0.25} sx={{ flex: 1 }}>
                          <MobileFieldLabel variant="caption">Entrada</MobileFieldLabel>
                          <Typography variant="body2" color="text.primary">
                            {formatTime(vehicle.checkInAt)}
                          </Typography>
                        </Stack>
                        <Stack spacing={0.25} sx={{ flex: 1 }}>
                          <MobileFieldLabel variant="caption">Saída</MobileFieldLabel>
                          <Typography variant="body2" color="text.primary">
                            {formatTime(vehicle.checkOutAt)}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Stack spacing={1.5}>
                        {canRegisterAccess && vehicle.isOpen ? (
                          <Button
                            variant="outlined"
                            color="inherit"
                            fullWidth
                            onClick={() =>
                              setCheckOutTarget({ type: 'vehicle', vehicleId: vehicle.id })
                            }
                            sx={{ color: 'text.primary', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                          >
                            Registrar saída
                          </Button>
                        ) : null}

                        <Button
                          variant="text"
                          color="primary"
                          onClick={() => setViewedVehicleId(vehicle.id)}
                        >
                          Ver mais
                        </Button>
                      </Stack>
                    </Stack>
                  </MobileListCard>
                ))}
              </Stack>
            )
          ) : (
            <Table>
              <TableHead>
                <TableHeadCell>Placa</TableHeadCell>
                <TableHeadCell>Modelo</TableHeadCell>
                <TableHeadCell>Movimentação</TableHeadCell>
                <TableHeadCell>Entrada</TableHeadCell>
                <TableHeadCell>Saída</TableHeadCell>
                <TableHeadCell align="right">Ações</TableHeadCell>
              </TableHead>
              <TableBody
                isEmpty={filteredVehicles.length === 0}
                emptyState={
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                }
                colSpan={COLUMN_COUNT}
              >
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {vehicle.plate ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {vehicle.brandModel ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <EventVehicleMovementBadge movementType={vehicle.movementType} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.primary">
                        {formatTime(vehicle.checkInAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatTime(vehicle.checkOutAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{renderAction(vehicle)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Stack>
      </CardContent>

      <EventVehicleDetailsDialog
        vehicle={viewedVehicle}
        onClose={() => setViewedVehicleId(null)}
        onRegisterCheckOut={(vehicleId) => {
          setViewedVehicleId(null)
          setCheckOutTarget({ type: 'vehicle', vehicleId })
        }}
      />

      <EventCheckOutDialog
        event={event}
        target={checkOutTarget}
        onClose={() => setCheckOutTarget(null)}
      />
    </MuiCard>
  )
}
