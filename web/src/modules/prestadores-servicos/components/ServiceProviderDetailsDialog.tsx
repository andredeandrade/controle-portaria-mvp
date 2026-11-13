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

import { useServiceProviderListContext } from '@/modules/prestadores-servicos/context/ServiceProviderListContext'
import { MobileFieldLabel } from '@/styles/MobileList.styles'

export function ServiceProviderDetailsDialog() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { viewedRecord: target, handleCloseView: onClose } = useServiceProviderListContext()

  if (!target) {
    return null
  }

  const hasVehicle = Boolean(
    target.vehiclePlate || target.vehicleBrandModel || target.vehicleColor,
  )
  const vehicleDescription = [target.vehicleBrandModel, target.vehicleColor]
    .filter(Boolean)
    .join(' ')

  return (
    <Dialog open={Boolean(target)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}
      >
        Dados do prestador de serviço
        <IconButton aria-label="Fechar" onClick={onClose} size="small">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5}>
          <Stack spacing={0.25}>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              {target.responsibleName}
            </Typography>
            {target.document ? (
              <Typography variant="caption" color="text.disabled">
                {target.document}
              </Typography>
            ) : null}
          </Stack>

          <Divider sx={{ borderColor: 'divider' }} />

          <Grid container spacing={2}>
            <Grid size={6}>
              <Stack spacing={0.25}>
                <MobileFieldLabel variant="caption">Empresa</MobileFieldLabel>
                <Typography variant="body2" color="text.primary">
                  {target.companyName}
                </Typography>
              </Stack>
            </Grid>
            <Grid size={6}>
              <Stack spacing={0.25}>
                <MobileFieldLabel variant="caption">Tipo de serviço</MobileFieldLabel>
                <Typography variant="body2" color="text.primary">
                  {target.serviceType}
                </Typography>
              </Stack>
            </Grid>
            <Grid size={6}>
              <Stack spacing={0.25}>
                <MobileFieldLabel variant="caption">Unidade</MobileFieldLabel>
                <Typography variant="body2" color="text.primary">
                  {target.unit || '-'}
                </Typography>
              </Stack>
            </Grid>
            <Grid size={6}>
              <Stack spacing={0.25}>
                <MobileFieldLabel variant="caption">Autorizado por</MobileFieldLabel>
                <Typography variant="body2" color="text.primary">
                  {target.authorizedBy || '-'}
                </Typography>
              </Stack>
            </Grid>
            <Grid size={6}>
              <Stack spacing={0.25}>
                <MobileFieldLabel variant="caption">Telefone</MobileFieldLabel>
                <Typography variant="body2" color="text.primary">
                  {target.phone || '-'}
                </Typography>
              </Stack>
            </Grid>
            <Grid size={6}>
              <Stack spacing={0.25}>
                <MobileFieldLabel variant="caption">E-mail</MobileFieldLabel>
                <Typography variant="body2" color="text.primary">
                  {target.email || '-'}
                </Typography>
              </Stack>
            </Grid>
            <Grid size={6}>
              <Stack spacing={0.25}>
                <MobileFieldLabel variant="caption">Veículo</MobileFieldLabel>
                {target.vehiclePlate ? (
                  <Typography variant="body2" color="text.primary">
                    {target.vehiclePlate}
                  </Typography>
                ) : null}
                <Typography variant="caption" color="text.disabled" fontFamily="monospace">
                  {hasVehicle ? vehicleDescription || '-' : '-'}
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: 'divider' }} />

          <Stack spacing={0.75}>
            <MobileFieldLabel variant="caption">Observações</MobileFieldLabel>
            <Typography variant="body2" color="text.primary">
              {target.observations || 'Nenhuma observação registrada.'}
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
          onClick={onClose}
          color="inherit"
          variant={isMobile ? 'text' : 'outlined'}
          fullWidth={isMobile}
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
