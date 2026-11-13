'use client'

import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useRouter } from 'next/navigation'

import { useOccurrenceListContext } from '@/modules/ocorrencias/context/OccurrenceListContext'
import { MobileFieldLabel } from '@/styles/MobileList.styles'

export function OccurrenceDetailsDialog() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const router = useRouter()
  const { viewedRecord: target, handleCloseView: onClose } = useOccurrenceListContext()

  if (!target) {
    return null
  }

  const handleEdit = () => {
    onClose()
    router.push(`/ocorrencias/${target.id}/editar`)
  }

  return (
    <Dialog open={Boolean(target)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}
      >
        Dados da ocorrência
        <IconButton aria-label="Fechar" onClick={onClose} size="small">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5}>
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              {target.occurrenceTypeLabel}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {target.place}
            </Typography>
          </Stack>

          <Divider sx={{ borderColor: 'divider' }} />

          <Grid container spacing={2}>
            <Grid size={6}>
              <Stack spacing={0.25}>
                <MobileFieldLabel variant="caption">Data</MobileFieldLabel>
                <Typography variant="body2" color="text.primary">
                  {target.date}
                </Typography>
              </Stack>
            </Grid>
            <Grid size={6}>
              <Stack spacing={0.25}>
                <MobileFieldLabel variant="caption">Hora</MobileFieldLabel>
                <Typography variant="body2" color="text.primary">
                  {target.time}
                </Typography>
              </Stack>
            </Grid>
            <Grid size={6}>
              <Stack spacing={0.25}>
                <MobileFieldLabel variant="caption">Registrado por</MobileFieldLabel>
                <Typography variant="body2" color="text.primary">
                  {target.createdByUserName}
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: 'divider' }} />

          <Stack spacing={0.75}>
            <MobileFieldLabel variant="caption">Descrição</MobileFieldLabel>
            <Typography variant="body2" color="text.primary">
              {target.report}
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          pb: 2.5,
          flexDirection: isMobile ? 'column' : 'row',
          gap: 1,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleEdit}
          fullWidth={isMobile}
          sx={{ order: isMobile ? 1 : 2 }}
        >
          Editar ocorrência
        </Button>
        <Button
          onClick={onClose}
          color="inherit"
          variant={isMobile ? 'text' : 'outlined'}
          fullWidth={isMobile}
          sx={{ order: isMobile ? 2 : 1 }}
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
