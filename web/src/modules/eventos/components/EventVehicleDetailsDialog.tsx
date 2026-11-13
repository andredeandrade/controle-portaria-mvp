'use client'

import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { EventVehicle } from '@/app/api/events/types'
import { useCan } from '@/hooks/useCan'
import { EventVehicleMovementBadge } from '@/modules/eventos/components/EventVehicleMovementBadge'
import { MobileFieldLabel } from '@/styles/MobileList.styles'

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

type EventVehicleDetailsDialogProps = {
  vehicle: EventVehicle | null
  onClose: () => void
  onRegisterCheckOut: (vehicleId: string) => void
}

export function EventVehicleDetailsDialog({
  vehicle,
  onClose,
  onRegisterCheckOut,
}: EventVehicleDetailsDialogProps) {
  const canRegisterAccess = useCan('events', 'registerAccess')

  if (!vehicle) {
    return null
  }

  return (
    <Dialog open={Boolean(vehicle)} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}
        >
          Dados do veículo
          <IconButton aria-label="Fechar" onClick={onClose} size="small">
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5}>
            <Stack spacing={0.5}>
              <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
                <Typography variant="h4" fontWeight={700} color="text.primary">
                  {vehicle.plate ?? '—'}
                </Typography>
                <EventVehicleMovementBadge movementType={vehicle.movementType} />
              </Stack>
              {vehicle.brandModel ? (
                <Typography variant="caption" color="text.disabled">
                  {vehicle.brandModel}
                </Typography>
              ) : null}
            </Stack>

            <Divider sx={{ borderColor: 'divider' }} />

            <Grid container spacing={2}>
              <Grid size={6}>
                <Stack spacing={0.25}>
                  <MobileFieldLabel variant="caption">Motorista</MobileFieldLabel>
                  <Typography variant="body2" fontWeight={700} color="text.primary">
                    {vehicle.driverName ?? '—'}
                  </Typography>
                  {vehicle.driverDocument ? (
                    <Typography variant="caption" color="text.disabled">
                      {vehicle.driverDocument}
                    </Typography>
                  ) : null}
                </Stack>
              </Grid>
              <Grid size={6}>
                <Stack spacing={0.25}>
                  <MobileFieldLabel variant="caption">Entrada</MobileFieldLabel>
                  <Typography variant="body2" fontWeight={700} color="text.primary">
                    {formatTime(vehicle.checkInAt)}
                  </Typography>
                </Stack>
              </Grid>
              <Grid size={6}>
                <Stack spacing={0.25}>
                  <MobileFieldLabel variant="caption">Saída</MobileFieldLabel>
                  <Typography variant="body2" fontWeight={700} color="text.primary">
                    {vehicle.checkOutAt ? formatTime(vehicle.checkOutAt) : '—'}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>

            {vehicle.occupants.length > 0 ? (
              <>
                <Divider sx={{ borderColor: 'divider' }} />
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <GroupsRoundedIcon color="primary" fontSize="small" />
                    <Typography variant="body2" fontWeight={700} color="text.primary">
                      Passageiros
                    </Typography>
                  </Stack>
                  {vehicle.occupants.map((occupant) => (
                    <Stack key={occupant.id} direction="row" spacing={1} alignItems="center">
                      <PersonRoundedIcon fontSize="small" color="disabled" />
                      <Typography variant="body2" color="text.primary">
                        {occupant.name}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </>
            ) : null}

            <Divider sx={{ borderColor: 'divider' }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit" variant="outlined">
            Fechar
          </Button>

          {canRegisterAccess && vehicle.isOpen ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() => onRegisterCheckOut(vehicle.id)}
            >
              Registrar saída do veículo
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>
  )
}
