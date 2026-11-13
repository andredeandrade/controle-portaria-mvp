'use client'

import LoginRoundedIcon from '@mui/icons-material/LoginRounded'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

import type { EventGuest } from '@/app/api/events/types'
import { useCheckInEventGuest } from '@/modules/eventos/hooks/useCheckInEventGuest'
import { TextField, TextFieldLabel, TextFieldStack } from '@/modules/form'
import { useAppSnackbar } from '@/providers'
import { MobileFieldLabel } from '@/styles/MobileList.styles'

type EventGuestCheckInDialogProps = {
  open: boolean
  onClose: () => void
  eventId: string
  guest: EventGuest
}

export function EventGuestCheckInDialog({
  open,
  onClose,
  eventId,
  guest,
}: EventGuestCheckInDialogProps) {
  const { showSuccess } = useAppSnackbar()
  const checkInMutation = useCheckInEventGuest()

  const [document, setDocument] = useState('')
  const [plate, setPlate] = useState('')
  const [brandModel, setBrandModel] = useState('')
  const [color, setColor] = useState('')

  const requiresDocument = !guest.document

  const resetFields = () => {
    setDocument('')
    setPlate('')
    setBrandModel('')
    setColor('')
  }

  const handleClose = () => {
    resetFields()
    checkInMutation.reset()
    onClose()
  }

  const handleSubmit = async () => {
    const hasVehicleData = Boolean(plate.trim() || brandModel.trim() || color.trim())

    try {
      await checkInMutation.mutateAsync({
        eventId,
        guestId: guest.id,
        document: requiresDocument ? document.trim() : undefined,
        vehicle: hasVehicleData
          ? {
              plate: plate.trim() || undefined,
              brandModel: brandModel.trim() || undefined,
              color: color.trim() || undefined,
            }
          : undefined,
      })

      showSuccess('Entrada registrada.')
      resetFields()
      onClose()
    } catch {
      // O erro é exibido no próprio diálogo.
    }
  }

  const isSubmitDisabled = (requiresDocument && !document.trim()) || checkInMutation.isPending

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Registrar entrada</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 3.5,
            mb: 2,
            borderRadius: 1,
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <LoginRoundedIcon color="success" />
          <Stack spacing={0.25}>
            <Typography variant="body2" fontWeight={700} color="text.primary">
              {guest.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              A entrada será registrada com a hora atual.
            </Typography>
          </Stack>
        </Box>

        {requiresDocument ? (
          <TextFieldStack>
            <TextFieldLabel required>CPF do convidado</TextFieldLabel>
            <TextField
              required
              value={document}
              onChange={(event) => setDocument(event.target.value)}
              disabled={checkInMutation.isPending}
              placeholder="000.000.000-00"
            />
          </TextFieldStack>
        ) : null}

        <Divider sx={{ my: 2, borderColor: 'divider' }} />

        <MobileFieldLabel variant="caption" sx={{ display: 'block', mb: 1.5 }}>
          Dados do veículo
        </MobileFieldLabel>

        <Grid container spacing={2}>
          <Grid size={6}>
            <TextFieldStack>
              <TextFieldLabel>Placa</TextFieldLabel>
              <TextField
                value={plate}
                onChange={(event) => setPlate(event.target.value)}
                disabled={checkInMutation.isPending}
                placeholder="ABC-1234"
              />
            </TextFieldStack>
          </Grid>

          <Grid size={6}>
            <TextFieldStack>
              <TextFieldLabel>Marca/Modelo</TextFieldLabel>
              <TextField
                value={brandModel}
                onChange={(event) => setBrandModel(event.target.value)}
                disabled={checkInMutation.isPending}
                placeholder="Ex: Fiat Argo"
              />
            </TextFieldStack>
          </Grid>

          <Grid size={6}>
            <TextFieldStack>
              <TextFieldLabel>Cor</TextFieldLabel>
              <TextField
                value={color}
                onChange={(event) => setColor(event.target.value)}
                disabled={checkInMutation.isPending}
                placeholder="Ex: Prata"
              />
            </TextFieldStack>
          </Grid>
        </Grid>

        {checkInMutation.isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {checkInMutation.error instanceof Error
              ? checkInMutation.error.message
              : 'Não foi possível registrar a entrada.'}
          </Alert>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          onClick={handleClose}
          color="inherit"
          variant="outlined"
          disabled={checkInMutation.isPending}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => void handleSubmit()}
          disabled={isSubmitDisabled}
        >
          {checkInMutation.isPending ? 'Registrando...' : 'Registrar entrada'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
