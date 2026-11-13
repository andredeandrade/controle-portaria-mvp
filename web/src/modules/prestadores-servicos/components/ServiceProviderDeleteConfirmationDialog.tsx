'use client'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

import { useServiceProviderListContext } from '@/modules/prestadores-servicos/context/ServiceProviderListContext'
import { useAppSnackbar } from '@/providers'

export function ServiceProviderDeleteConfirmationDialog() {
  const { showSuccess, showError } = useAppSnackbar()
  const {
    selectedRecord: target,
    handleConfirmDelete: onConfirm,
    isDeletePending: isPending,
    handleCloseDeleteConfirmation: onClose,
  } = useServiceProviderListContext()

  if (!target) {
    return null
  }

  const handleConfirm = async () => {
    try {
      await onConfirm()
      onClose()
      showSuccess('Prestador de serviço excluído com sucesso.')
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : 'Não foi possível excluir o prestador de serviço.',
      )
    }
  }

  return (
    <Dialog open={Boolean(target)} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Excluir prestador de serviço</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Tem certeza que deseja excluir {target.responsibleName} ({target.companyName})? Essa
          ação não pode ser desfeita.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit" variant="outlined" disabled={isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => void handleConfirm()}
          disabled={isPending}
        >
          {isPending ? 'Excluindo...' : 'Excluir'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
