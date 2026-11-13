'use client'

import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
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

import { useResidentListContext } from '@/modules/moradores/context/ResidentListContext'
import {
  DEFAULT_RESIDENT_CATEGORY_CHIP_COLOR,
  residentCategoryChipColor,
} from '@/modules/moradores/styles/ResidentStyles'
import { MobileFieldLabel } from '@/styles/MobileList.styles'

export function ResidentDetailsDialog() {
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { viewedRecord: target, handleCloseView: onClose } = useResidentListContext()

  if (!target) {
    return null
  }

  const chipColor =
    residentCategoryChipColor[target.relation.toLowerCase()] ?? DEFAULT_RESIDENT_CATEGORY_CHIP_COLOR

  const handleEdit = () => {
    onClose()
    router.push(`/moradores/${target.id}/editar`)
  }

  return (
    <Dialog open={Boolean(target)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}
      >
        Dados do morador
        <IconButton aria-label="Fechar" onClick={onClose} size="small">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Typography variant="h4" fontWeight={700} color="text.primary">
                {target.name}
              </Typography>
              {target.document ? (
                <Typography variant="caption" color="text.disabled">
                  CPF: {target.document}
                </Typography>
              ) : null}
            </Stack>
            <Chip
              label={target.relation}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.6875rem',
                fontWeight: 600,
                backgroundColor: chipColor.bg,
                color: chipColor.color,
                border: 'none',
                flexShrink: 0,
              }}
            />
          </Stack>

          <Divider sx={{ borderColor: 'divider' }} />

          <Grid container spacing={2}>
            <Grid size={6}>
              <Stack spacing={0.25}>
                <MobileFieldLabel variant="caption">
                  {target.units.length > 1 ? 'Unidades' : 'Unidade'}
                </MobileFieldLabel>
                <Typography variant="body2" color="text.primary">
                  {target.units.join(', ') || '-'}
                </Typography>
              </Stack>
            </Grid>
            <Grid size={6}>
              <Stack spacing={0.25}>
                <MobileFieldLabel variant="caption">Vínculo</MobileFieldLabel>
                <Typography variant="body2" color="text.primary">
                  {target.relation}
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
          </Grid>

          <Divider sx={{ borderColor: 'divider' }} />

          <Stack spacing={0.75}>
            <MobileFieldLabel variant="caption">Veículos</MobileFieldLabel>
            {target.vehicles.length > 0 ? (
              <Stack direction="row" spacing={0.75} flexWrap="wrap">
                {target.vehicles.map((vehicle, index) => (
                  <Chip
                    key={`${target.id}-${vehicle.plate}-${index}`}
                    label={vehicle.plate}
                    size="small"
                    variant="outlined"
                    sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 600 }}
                  />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.disabled">
                -
              </Typography>
            )}
          </Stack>

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
          variant="contained"
          color="primary"
          onClick={handleEdit}
          fullWidth={isMobile}
          sx={{ order: isMobile ? 1 : 2 }}
        >
          Editar cadastro
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
