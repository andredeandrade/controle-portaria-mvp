'use client'

import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import LoginRoundedIcon from '@mui/icons-material/LoginRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
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

import type { Event, EventGuest } from '@/app/api/events/types'
import { useCan } from '@/hooks/useCan'
import {
  EventCheckOutDialog,
  type EventCheckOutTarget,
} from '@/modules/eventos/components/EventCheckOutDialog'
import { EventGuestCheckInDialog } from '@/modules/eventos/components/EventGuestCheckInDialog'
import { EventGuestDetailsDialog } from '@/modules/eventos/components/EventGuestDetailsDialog'
import {
  EventGuestStatusChip,
  getEventGuestStatus,
  type EventGuestStatus,
} from '@/modules/eventos/components/EventGuestStatusChip'
import { Table } from '@/modules/table/components/Table'
import { TableBody } from '@/modules/table/components/TableBody'
import { TableCell } from '@/modules/table/components/TableCell'
import { TableHead } from '@/modules/table/components/TableHead'
import { TableHeadCell } from '@/modules/table/components/TableHeadCell'
import { TableRow } from '@/modules/table/components/TableRow'
import { ListSearchField } from '@/modules/table/components/ListSearchField'
import { MobileFieldLabel, MobileListCard } from '@/styles/MobileList.styles'

const COLUMN_COUNT = 5

type GuestFilter = 'todos' | EventGuestStatus

const FILTER_LABEL: Record<GuestFilter, string> = {
  todos: 'Todos',
  aguardando: 'Aguardando',
  presente: 'Presentes',
  saiu: 'Saíram',
}

const FILTER_PALETTE: Record<GuestFilter, 'primary' | 'warning' | 'success' | 'default'> = {
  todos: 'primary',
  aguardando: 'warning',
  presente: 'success',
  saiu: 'default',
}

function formatTime(iso: string | null): string {
  if (!iso) {
    return '—'
  }

  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function matchesSearch(guest: EventGuest, searchTerm: string): boolean {
  const normalizedSearch = searchTerm.trim().toLowerCase()

  if (!normalizedSearch) {
    return true
  }

  const name = guest.name.toLowerCase()
  const document = guest.document?.toLowerCase() ?? ''

  return name.includes(normalizedSearch) || document.includes(normalizedSearch)
}

type EventGuestsCardProps = {
  event: Event
}

export function EventGuestsCard({ event }: EventGuestsCardProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<GuestFilter>('todos')
  const [viewedGuestId, setViewedGuestId] = useState<string | null>(null)
  const [checkInGuestId, setCheckInGuestId] = useState<string | null>(null)
  const [checkOutTarget, setCheckOutTarget] = useState<EventCheckOutTarget | null>(null)
  const canRegisterAccess = useCan('events', 'registerAccess')

  const guestsCount = event.guests.length
  const presentCount = event.guests.filter(
    (guest) => getEventGuestStatus(guest.checkInAt, guest.checkOutAt) === 'presente',
  ).length
  const departedCount = event.guests.filter(
    (guest) => getEventGuestStatus(guest.checkInAt, guest.checkOutAt) === 'saiu',
  ).length
  const waitingCount = event.guests.filter(
    (guest) => getEventGuestStatus(guest.checkInAt, guest.checkOutAt) === 'aguardando',
  ).length

  const filteredGuests = event.guests.filter((guest) => {
    if (!matchesSearch(guest, searchTerm)) {
      return false
    }

    if (statusFilter === 'todos') {
      return true
    }

    return getEventGuestStatus(guest.checkInAt, guest.checkOutAt) === statusFilter
  })

  const viewedGuest = event.guests.find((guest) => guest.id === viewedGuestId) ?? null
  const checkInGuest = event.guests.find((guest) => guest.id === checkInGuestId) ?? null

  const emptyMessage =
    guestsCount === 0
      ? 'Nenhum convidado cadastrado para este evento.'
      : 'Nenhum convidado corresponde ao filtro selecionado.'

  const renderAction = (guest: EventGuest, status: EventGuestStatus) => (
    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
      <Tooltip title="Visualizar">
        <IconButton
          aria-label={`Visualizar ${guest.name}`}
          size="small"
          onClick={() => setViewedGuestId(guest.id)}
        >
          <VisibilityRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {canRegisterAccess && status === 'aguardando' ? (
        <Tooltip title="Registrar entrada">
          <IconButton
            aria-label={`Registrar entrada de ${guest.name}`}
            size="small"
            color="success"
            onClick={() => setCheckInGuestId(guest.id)}
          >
            <LoginRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : null}

      {canRegisterAccess && status === 'presente' ? (
        <Tooltip title="Registrar saída">
          <IconButton
            aria-label={`Registrar saída de ${guest.name}`}
            size="small"
            color="warning"
            onClick={() => setCheckOutTarget({ type: 'guest', guestId: guest.id })}
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
            <GroupsRoundedIcon color="primary" fontSize="small" />
            <Typography variant="h4">Convidados</Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {`${presentCount} presentes · ${departedCount} saídas · ${waitingCount} aguardando`}
          </Typography>

          <ListSearchField
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar convidado..."
            sx={{ width: '100%', maxWidth: 420 }}
          />

          <Stack
            direction="row"
            spacing={1}
            sx={{
              flexWrap: { xs: 'nowrap', sm: 'wrap' },
              rowGap: 1,
              overflowX: { xs: 'auto', sm: 'visible' },
              pb: { xs: 3, sm: 0 },
            }}
          >
            {(['todos', 'aguardando', 'presente', 'saiu'] as GuestFilter[]).map((filter) => {
              const count =
                filter === 'todos'
                  ? guestsCount
                  : filter === 'aguardando'
                    ? waitingCount
                    : filter === 'presente'
                      ? presentCount
                      : departedCount

              const isActive = statusFilter === filter
              const paletteKey = FILTER_PALETTE[filter]
              const dotColor =
                paletteKey === 'default'
                  ? theme.palette.text.disabled
                  : theme.palette[paletteKey].main
              const activeTextColor =
                paletteKey === 'default'
                  ? theme.palette.text.primary
                  : theme.palette[paletteKey].main

              return (
                <Box
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
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
                    sx={{ color: isActive ? activeTextColor : 'text.secondary' }}
                  >
                    {`${FILTER_LABEL[filter]} (${count})`}
                  </Typography>
                </Box>
              )
            })}
          </Stack>

          {isMobile ? (
            filteredGuests.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {emptyMessage}
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {filteredGuests.map((guest) => {
                  const status = getEventGuestStatus(guest.checkInAt, guest.checkOutAt)

                  return (
                    <MobileListCard key={guest.id} variant="outlined">
                      <Stack spacing={3}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                        >
                          <Stack spacing={0.25}>
                            <Typography variant="body2" fontWeight={700} color="text.primary">
                              {guest.name}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                              {guest.document ?? '—'}
                            </Typography>
                          </Stack>

                          <EventGuestStatusChip
                            checkInAt={guest.checkInAt}
                            checkOutAt={guest.checkOutAt}
                          />
                        </Stack>

                        <Divider sx={{ borderColor: 'divider' }} />

                        <Stack direction="row">
                          <Stack spacing={0.25} sx={{ flex: 1 }}>
                            <MobileFieldLabel variant="caption">Entrada</MobileFieldLabel>
                            <Typography variant="body2" color="text.primary">
                              {formatTime(guest.checkInAt)}
                            </Typography>
                          </Stack>
                          <Stack spacing={0.25} sx={{ flex: 1 }}>
                            <MobileFieldLabel variant="caption">Saída</MobileFieldLabel>
                            <Typography variant="body2" color="text.primary">
                              {formatTime(guest.checkOutAt)}
                            </Typography>
                          </Stack>
                        </Stack>

                        <Stack spacing={1.5}>
                          {canRegisterAccess && status === 'aguardando' ? (
                            <Button
                              variant="contained"
                              color="primary"
                              fullWidth
                              onClick={() => setCheckInGuestId(guest.id)}
                            >
                              Registrar entrada
                            </Button>
                          ) : null}

                          {canRegisterAccess && status === 'presente' ? (
                            <Button
                              variant="outlined"
                              color="inherit"
                              fullWidth
                              onClick={() =>
                                setCheckOutTarget({ type: 'guest', guestId: guest.id })
                              }
                              sx={{
                                color: 'text.primary',
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                              }}
                            >
                              Registrar saída
                            </Button>
                          ) : null}

                          <Button
                            variant="text"
                            color="primary"
                            onClick={() => setViewedGuestId(guest.id)}
                          >
                            Ver mais
                          </Button>
                        </Stack>
                      </Stack>
                    </MobileListCard>
                  )
                })}
              </Stack>
            )
          ) : (
            <Table>
              <TableHead>
                <TableHeadCell>Convidado</TableHeadCell>
                <TableHeadCell>Entrada</TableHeadCell>
                <TableHeadCell>Saída</TableHeadCell>
                <TableHeadCell>Situação</TableHeadCell>
                <TableHeadCell align="right">Ação</TableHeadCell>
              </TableHead>
              <TableBody
                isEmpty={filteredGuests.length === 0}
                emptyState={
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                }
                colSpan={COLUMN_COUNT}
              >
                {filteredGuests.map((guest) => {
                  const status = getEventGuestStatus(guest.checkInAt, guest.checkOutAt)

                  return (
                    <TableRow key={guest.id}>
                      <TableCell>
                        <Stack spacing={0.25}>
                          <Typography variant="body2" fontWeight={600} color="text.primary">
                            {guest.name}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {guest.document ?? '—'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.primary">
                          {formatTime(guest.checkInAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatTime(guest.checkOutAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <EventGuestStatusChip
                          checkInAt={guest.checkInAt}
                          checkOutAt={guest.checkOutAt}
                        />
                      </TableCell>
                      <TableCell align="right">{renderAction(guest, status)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </Stack>
      </CardContent>

      <EventGuestDetailsDialog
        event={event}
        guest={viewedGuest}
        onClose={() => setViewedGuestId(null)}
      />

      {checkInGuest ? (
        <EventGuestCheckInDialog
          open={Boolean(checkInGuest)}
          onClose={() => setCheckInGuestId(null)}
          eventId={event.id}
          guest={checkInGuest}
        />
      ) : null}

      <EventCheckOutDialog
        event={event}
        target={checkOutTarget}
        onClose={() => setCheckOutTarget(null)}
      />
    </MuiCard>
  )
}
