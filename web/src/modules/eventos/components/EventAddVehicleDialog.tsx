'use client'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { useState } from 'react'

import { useCreateEventVehicle } from '@/modules/eventos/hooks/useCreateEventVehicle'
import { TextField, TextFieldLabel, TextFieldStack } from '@/modules/form'
import { useAppSnackbar } from '@/providers'

type EventAddVehicleDialogProps = {
  open: boolean
  onClose: () => void
  eventId: string
}

export function EventAddVehicleDialog({ open, onClose, eventId }: EventAddVehicleDialogProps) {
  const { showSuccess } = useAppSnackbar()
  const createVehicleMutation = useCreateEventVehicle()

  const [plate, setPlate] = useState('')
  const [brandModel, setBrandModel] = useState('')
  const [driverName, setDriverName] = useState('')

  const resetFields = () => {
    setPlate('')
    setBrandModel('')
    setDriverName('')
  }

  const handleClose = () => {
    resetFields()
    createVehicleMutation.reset()
    onClose()
  }

  const handleSubmit = async () => {
    try {
      await createVehicleMutation.mutateAsync({
        eventId,
        plate: plate.trim(),
        brandModel: brandModel.trim() || undefined,
        driverName: driverName.trim() || undefined,
      })

      showSuccess('Veículo adicionado.')
      resetFields()
      onClose()
    } catch {
      // O erro e exibido no proprio dialogo.
    }
  }

  const isSubmitDisabled = !plate.trim() || createVehicleMutation.isPending

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Adicionar veículo</DialogTitle>
      <DialogContent>
        <TextFieldStack sx={{ mt: 1 }}>
          <TextFieldLabel required>Placa</TextFieldLabel>
          <TextField
            required
            value={plate}
            onChange={(event) => setPlate(event.target.value)}
            disabled={createVehicleMutation.isPending}
          />
        </TextFieldStack>

        <TextFieldStack sx={{ mt: 2 }}>
          <TextFieldLabel>Modelo</TextFieldLabel>
          <TextField
            value={brandModel}
            onChange={(event) => setBrandModel(event.target.value)}
            disabled={createVehicleMutation.isPending}
          />
        </TextFieldStack>

        <TextFieldStack sx={{ mt: 2 }}>
          <TextFieldLabel>Condutor</TextFieldLabel>
          <TextField
            value={driverName}
            onChange={(event) => setDriverName(event.target.value)}
            disabled={createVehicleMutation.isPending}
          />
        </TextFieldStack>

        {createVehicleMutation.isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {createVehicleMutation.error instanceof Error
              ? createVehicleMutation.error.message
              : 'Não foi possível adicionar o veículo.'}
          </Alert>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={handleClose} color="inherit" variant="outlined" disabled={createVehicleMutation.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => void handleSubmit()}
          disabled={isSubmitDisabled}
        >
          {createVehicleMutation.isPending ? 'Adicionando...' : 'Adicionar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
