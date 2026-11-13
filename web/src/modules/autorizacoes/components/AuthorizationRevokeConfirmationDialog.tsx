'use client'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

import { useAuthorizationListContext } from '@/modules/autorizacoes/context/AuthorizationListContext'
import { useAppSnackbar } from '@/providers'

export function AuthorizationRevokeConfirmationDialog() {
  const { showSuccess, showError } = useAppSnackbar()
  const {
    selectedRecord: target,
    handleConfirmDelete: onConfirm,
    isDeletePending: isPending,
    handleCloseDeleteConfirmation: onClose,
  } = useAuthorizationListContext()

  if (!target) {
    return null
  }

  const handleConfirm = async () => {
    try {
      await onConfirm()
      onClose()
      showSuccess('Acesso revogado com sucesso.')
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Não foi possível revogar o acesso.')
    }
  }

  return (
    <Dialog open={Boolean(target)} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Revogar acesso</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Tem certeza que deseja revogar o acesso de {target.authorizedName}? Essa ação não pode
          ser desfeita.
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
          {isPending ? 'Revogando...' : 'Revogar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
