'use client'

import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import MuiCard from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

import type { Event, EventGuest, EventVehicleMovementType } from '@/app/api/events/types'
import { TextField, TextFieldLabel, TextFieldStack } from '@/modules/form'
import { ListSearchField } from '@/modules/table/components/ListSearchField'
import { MobileFieldLabel } from '@/styles/MobileList.styles'

export type NewGuestField = {
  id: string
  name: string
  document: string
}

function isGuestEligible(guest: EventGuest, movementType: EventVehicleMovementType): boolean {
  if (movementType === 'BUSCA') {
    return Boolean(guest.checkInAt) && !guest.checkOutAt
  }

  return !guest.checkInAt || Boolean(guest.checkOutAt)
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

type EventAccessGuestsCardProps = {
  event: Event
  movementType: EventVehicleMovementType
  selectedGuestIds: string[]
  onToggleGuest: (guestId: string) => void
  guestDocuments: Record<string, string>
  onGuestDocumentChange: (guestId: string, value: string) => void
  newGuestFields: NewGuestField[]
  onAppendNewGuest: (value: { name: string; document: string }) => void
  onRemoveNewGuest: (index: number) => void
}

export function EventAccessGuestsCard({
  event,
  movementType,
  selectedGuestIds,
  onToggleGuest,
  guestDocuments,
  onGuestDocumentChange,
  newGuestFields,
  onAppendNewGuest,
  onRemoveNewGuest,
}: EventAccessGuestsCardProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewGuestForm, setShowNewGuestForm] = useState(false)
  const [newGuestName, setNewGuestName] = useState('')
  const [newGuestDocument, setNewGuestDocument] = useState('')

  const canAddNewGuest = movementType !== 'BUSCA'

  const eligibleGuests = event.guests.filter(
    (guest) => isGuestEligible(guest, movementType) && matchesSearch(guest, searchTerm),
  )

  const emptyMessage =
    movementType === 'BUSCA'
      ? 'Nenhum convidado presente no evento para buscar.'
      : 'Nenhum convidado aguardando ou fora do evento para liberar entrada.'

  const handleAddNewGuest = () => {
    if (!newGuestName.trim() || !newGuestDocument.trim()) {
      return
    }

    onAppendNewGuest({ name: newGuestName.trim(), document: newGuestDocument.trim() })
    setNewGuestName('')
    setNewGuestDocument('')
    setShowNewGuestForm(false)
  }

  return (
    <MuiCard>
      <CardContent>
        <Stack spacing={2}>
          <MobileFieldLabel variant="caption">
            {movementType === 'BUSCA' ? 'Quem está buscando' : 'Quem está entrando'}
          </MobileFieldLabel>

          <ListSearchField
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por nome ou CPF..."
            sx={{ width: '100%' }}
          />

          {eligibleGuests.length === 0 && newGuestFields.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {emptyMessage}
            </Typography>
          ) : (
            <Stack spacing={1.5} divider={<Divider sx={{ borderColor: 'divider' }} />}>
              {eligibleGuests.map((guest) => {
                const isSelected = selectedGuestIds.includes(guest.id)
                const needsDocument = isSelected && !guest.document && movementType !== 'BUSCA'

                return (
                  <Stack
                    key={guest.id}
                    spacing={1}
                    sx={{
                      borderRadius: 1,
                      p: needsDocument ? 2 : 0,
                      bgcolor: needsDocument ? 'rgba(52, 211, 153, 0.08)' : 'transparent',
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => onToggleGuest(guest.id)}
                        aria-label={`Selecionar ${guest.name}`}
                      />
                      <Stack spacing={0.25} sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={700} color="text.primary">
                          {guest.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color={guest.document ? 'text.disabled' : 'warning.main'}
                        >
                          {guest.document ?? 'Sem CPF cadastrado'}
                        </Typography>
                      </Stack>
                    </Stack>

                    {needsDocument ? (
                      <TextField
                        required
                        value={guestDocuments[guest.id] ?? ''}
                        onChange={(event) => onGuestDocumentChange(guest.id, event.target.value)}
                        placeholder="Informe o CPF para liberar a entrada"
                        aria-label={`CPF de ${guest.name}`}
                        sx={{ ml: 5 }}
                      />
                    ) : null}
                  </Stack>
                )
              })}

              {newGuestFields.map((field, index) => (
                <Stack
                  key={field.id}
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{
                    borderRadius: 1,
                    p: 2,
                    bgcolor: 'rgba(52, 211, 153, 0.08)',
                  }}
                >
                  <Checkbox
                    checked
                    onChange={() => onRemoveNewGuest(index)}
                    aria-label={`Remover ${field.name} da lista`}
                  />
                  <Stack spacing={0.25} sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={700} color="text.primary">
                      {field.name}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {field.document}
                    </Typography>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}

          {canAddNewGuest ? (
            <Stack spacing={1.5}>
              <Button
                variant="text"
                color="primary"
                startIcon={<PersonAddRoundedIcon fontSize="small" />}
                onClick={() => setShowNewGuestForm((current) => !current)}
                sx={{ alignSelf: 'flex-start' }}
              >
                {showNewGuestForm ? 'Fechar cadastro' : 'A pessoa não está na lista'}
              </Button>

              {showNewGuestForm ? (
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack spacing={2}>
                    <Typography variant="body2" color="text.secondary">
                      A pessoa não está na lista do evento. O cadastro fica marcado como autorizado
                      na portaria.
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextFieldStack>
                          <TextFieldLabel required>Nome</TextFieldLabel>
                          <TextField
                            value={newGuestName}
                            onChange={(event) => setNewGuestName(event.target.value)}
                            placeholder="Nome completo"
                          />
                        </TextFieldStack>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextFieldStack>
                          <TextFieldLabel required>CPF</TextFieldLabel>
                          <TextField
                            value={newGuestDocument}
                            onChange={(event) => setNewGuestDocument(event.target.value)}
                            placeholder="000.000.000-00"
                          />
                        </TextFieldStack>
                      </Grid>
                    </Grid>

                    <Button
                      variant="outlined"
                      color="primary"
                      disabled={!newGuestName.trim() || !newGuestDocument.trim()}
                      onClick={handleAddNewGuest}
                      sx={{ alignSelf: 'flex-end' }}
                    >
                      Adicionar à lista
                    </Button>
                  </Stack>
                </Box>
              ) : null}
            </Stack>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Busca de convidado só aceita convidados já presentes no evento.
            </Typography>
          )}
        </Stack>
      </CardContent>
    </MuiCard>
  )
}
