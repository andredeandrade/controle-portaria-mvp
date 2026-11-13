'use client'

import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'

import type { Event, EventGuest, EventVehicleMovementType } from '@/app/api/events/types'
import { useCheckOutEventGuest } from '@/modules/eventos/hooks/useCheckOutEventGuest'
import { useCheckOutEventVehicle } from '@/modules/eventos/hooks/useCheckOutEventVehicle'
import { useAppSnackbar } from '@/providers'
import { MobileFieldLabel } from '@/styles/MobileList.styles'

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export type EventCheckOutTarget =
  | { type: 'guest'; guestId: string }
  | { type: 'vehicle'; vehicleId: string }

function getCascadeGuests(
  event: Event,
  vehicleId: string,
  movementType: EventVehicleMovementType,
): EventGuest[] {
  if (movementType === 'CONVIDADO') {
    return event.guests.filter((guest) => guest.entryVehicle?.id === vehicleId && !guest.checkOutAt)
  }

  if (movementType === 'DESEMBARQUE') {
    return []
  }

  return event.guests.filter((guest) => guest.exitVehicle?.id === vehicleId && !guest.checkOutAt)
}

type EventCheckOutDialogProps = {
  event: Event
  target: EventCheckOutTarget | null
  onClose: () => void
}

export function EventCheckOutDialog({ event, target, onClose }: EventCheckOutDialogProps) {
  const { showSuccess, showError } = useAppSnackbar()
  const checkOutGuestMutation = useCheckOutEventGuest()
  const checkOutVehicleMutation = useCheckOutEventVehicle()
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([])

  const vehicle =
    target?.type === 'vehicle'
      ? event.vehicles.find((item) => item.id === target.vehicleId)
      : undefined

  const cascadeGuests =
    target?.type === 'vehicle' && vehicle
      ? getCascadeGuests(event, vehicle.id, vehicle.movementType)
      : []

  const cascadeVehicleId = vehicle?.id ?? null

  useEffect(() => {
    if (cascadeVehicleId) {
      setSelectedGuestIds(getCascadeGuestsForEffect())
    }

    function getCascadeGuestsForEffect() {
      const currentVehicle = event.vehicles.find((item) => item.id === cascadeVehicleId)

      if (!currentVehicle) {
        return []
      }

      return getCascadeGuests(event, currentVehicle.id, currentVehicle.movementType).map(
        (guest) => guest.id,
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cascadeVehicleId])

  if (!target) {
    return null
  }

  const isPending = checkOutGuestMutation.isPending || checkOutVehicleMutation.isPending
  const mutationError = checkOutGuestMutation.error ?? checkOutVehicleMutation.error

  const handleClose = () => {
    checkOutGuestMutation.reset()
    checkOutVehicleMutation.reset()
    onClose()
  }

  const toggleGuestSelection = (guestId: string) => {
    setSelectedGuestIds((current) =>
      current.includes(guestId) ? current.filter((id) => id !== guestId) : [...current, guestId],
    )
  }

  const handleConfirm = async () => {
    try {
      if (target.type === 'guest') {
        await checkOutGuestMutation.mutateAsync({ eventId: event.id, guestId: target.guestId })
      } else {
        await checkOutVehicleMutation.mutateAsync({
          eventId: event.id,
          vehicleId: target.vehicleId,
          guestIds: selectedGuestIds.length ? selectedGuestIds : undefined,
        })
      }

      showSuccess('Saída registrada.')
      onClose()
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Não foi possível registrar a saída.')
    }
  }

  return (
    <Dialog open={Boolean(target)} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Registrar saída</DialogTitle>
      <DialogContent>
        {target.type === 'guest' ? (
          <DialogContentText>Confirma o registro de saída deste convidado?</DialogContentText>
        ) : (
          <Stack spacing={3.5}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                p: 3.5,
                borderRadius: 1,
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <GroupsRoundedIcon color="success" />
              <Stack spacing={0.25}>
                <Typography variant="body2" fontWeight={700} color="text.primary">
                  {`Saída do veículo · ${vehicle?.plate ?? ''}`}
                </Typography>
                {vehicle?.movementType !== 'DESEMBARQUE' ? (
                  <Typography variant="caption" color="text.secondary">
                    Confirme quais convidados vinculados saem junto com o veículo.
                  </Typography>
                ) : null}
              </Stack>
            </Box>

            {cascadeGuests.length > 0 ? (
              <Stack spacing={2}>
                <MobileFieldLabel variant="caption">Convidados vinculados</MobileFieldLabel>
                <Stack spacing={1}>
                  {cascadeGuests.map((guest) => {
                    const isChecked = selectedGuestIds.includes(guest.id)

                    return (
                      <FormControlLabel
                        key={guest.id}
                        control={
                          <Checkbox
                            checked={isChecked}
                            onChange={() => toggleGuestSelection(guest.id)}
                            disabled={isPending}
                          />
                        }
                        label={
                          <Stack spacing={0.25}>
                            <Typography variant="body2" fontWeight={700} color="text.primary">
                              {guest.name}
                            </Typography>
                            {guest.checkInAt ? (
                              <Typography variant="caption" color="text.secondary">
                                {`Entrada ${formatTime(guest.checkInAt)}`}
                              </Typography>
                            ) : null}
                          </Stack>
                        }
                        sx={{
                          m: 0,
                          width: '100%',
                          alignItems: 'center',
                          px: 1.5,
                          py: 3,
                          borderRadius: 1,
                          bgcolor: isChecked ? 'rgba(52, 211, 153, 0.08)' : 'transparent',
                        }}
                      />
                    )
                  })}
                </Stack>
              </Stack>
            ) : null}
          </Stack>
        )}

        {mutationError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {mutationError instanceof Error
              ? mutationError.message
              : 'Não foi possível registrar a saída.'}
          </Alert>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={handleClose} color="inherit" variant="outlined" disabled={isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => void handleConfirm()}
          disabled={isPending}
        >
          {isPending
            ? 'Registrando...'
            : target.type === 'vehicle'
              ? 'Confirmar saída'
              : 'Registrar saída'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
