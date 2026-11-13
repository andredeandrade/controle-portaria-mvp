'use client'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { useState } from 'react'

import { useCreateEventGuest } from '@/modules/eventos/hooks/useCreateEventGuest'
import { TextField, TextFieldLabel, TextFieldStack } from '@/modules/form'
import { useAppSnackbar } from '@/providers'

type EventAddGuestDialogProps = {
  open: boolean
  onClose: () => void
  eventId: string
}

export function EventAddGuestDialog({ open, onClose, eventId }: EventAddGuestDialogProps) {
  const { showSuccess } = useAppSnackbar()
  const createGuestMutation = useCreateEventGuest()

  const [name, setName] = useState('')
  const [document, setDocument] = useState('')

  const resetFields = () => {
    setName('')
    setDocument('')
  }

  const handleClose = () => {
    resetFields()
    createGuestMutation.reset()
    onClose()
  }

  const handleSubmit = async () => {
    try {
      await createGuestMutation.mutateAsync({
        eventId,
        name: name.trim(),
        document: document.trim() || undefined,
      })

      showSuccess('Convidado adicionado.')
      resetFields()
      onClose()
    } catch {
      // O erro e exibido no proprio dialogo.
    }
  }

  const isSubmitDisabled = !name.trim() || createGuestMutation.isPending

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Adicionar convidado</DialogTitle>
      <DialogContent>
        <TextFieldStack sx={{ mt: 1 }}>
          <TextFieldLabel required>Nome</TextFieldLabel>
          <TextField
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={createGuestMutation.isPending}
          />
        </TextFieldStack>

        <TextFieldStack sx={{ mt: 2 }}>
          <TextFieldLabel>Documento</TextFieldLabel>
          <TextField
            value={document}
            onChange={(event) => setDocument(event.target.value)}
            disabled={createGuestMutation.isPending}
          />
        </TextFieldStack>

        {createGuestMutation.isError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {createGuestMutation.error instanceof Error
              ? createGuestMutation.error.message
              : 'Não foi possível adicionar o convidado.'}
          </Alert>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={handleClose} color="inherit" variant="outlined" disabled={createGuestMutation.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => void handleSubmit()}
          disabled={isSubmitDisabled}
        >
          {createGuestMutation.isPending ? 'Adicionando...' : 'Adicionar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
