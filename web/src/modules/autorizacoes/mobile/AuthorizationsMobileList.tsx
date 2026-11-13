'use client'

import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/navigation'

import { useCan } from '@/hooks/useCan'
import { RegisterAuthorizationButton } from '@/modules/autorizacoes/components/RegisterAuthorizationButton'
import { useAuthorizationListContext } from '@/modules/autorizacoes/context/AuthorizationListContext'
import { AuthorizationsMobileListLoader } from '@/modules/autorizacoes/mobile/AuthorizationsMobileListLoader'
import { ListEmptyState } from '@/modules/table/components/ListEmptyState'
import { ListErrorState } from '@/modules/table/components/ListErrorState'
import { MobileFieldLabel, MobileListCard } from '@/styles/MobileList.styles'

const SKELETON_CARD_COUNT = 5

export function AuthorizationsMobileList() {
  const router = useRouter()
  const {
    records,
    isLoading,
    isError,
    errorMessage,
    refetch: onRetry,
    handleClearFilters,
    handleOpenDeleteConfirmation,
    handleOpenView,
  } = useAuthorizationListContext()
  const canUpdate = useCan('authorizations', 'update')
  const canRemove = useCan('authorizations', 'remove')

  return (
    <Stack spacing={3}>
      {isError ? (
        <ListErrorState
          title="Não foi possível carregar as autorizações."
          message={errorMessage}
          onRetry={onRetry}
        />
      ) : isLoading ? (
        Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
          <AuthorizationsMobileListLoader key={index} />
        ))
      ) : records.length === 0 ? (
        <ListEmptyState
          title="Nenhuma autorização encontrada."
          description="Nenhum registro corresponde à busca realizada. Ajuste os critérios ou cadastre uma nova autorização."
          actions={
            <>
              <Button variant="outlined" onClick={handleClearFilters}>
                Limpar busca
              </Button>
              <RegisterAuthorizationButton />
            </>
          }
        />
      ) : (
        records.map((record) => (
          <MobileListCard key={record.id} variant="outlined" sx={{ p: 5 }}>
            <Stack spacing={5}>
              <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                <Typography variant="body1" fontWeight={700} color="text.primary">
                  {record.authorizedName}
                </Typography>
                <Typography variant="caption" color="text.disabled" fontFamily="monospace">
                  {record.document}
                </Typography>
              </Stack>

              <Grid container spacing={2}>
                <Grid size={6}>
                  <Stack spacing={0.25}>
                    <MobileFieldLabel variant="caption">Válido de</MobileFieldLabel>
                    <Typography variant="body2" color="text.primary" fontFamily="monospace">
                      {record.validFromDate} {record.validFromTime}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid size={6}>
                  <Stack spacing={0.25}>
                    <MobileFieldLabel variant="caption">Válido até</MobileFieldLabel>
                    <Typography variant="body2" color="text.primary" fontFamily="monospace">
                      {record.validToDate} {record.validToTime}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid size={12}>
                  <Stack spacing={0.25}>
                    <MobileFieldLabel variant="caption">Unidade</MobileFieldLabel>
                    <Typography variant="body2" color="text.primary">
                      {record.unit}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>

              <Divider sx={{ borderColor: 'divider' }} />

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" color="primary" onClick={() => handleOpenView(record)}>
                    Visualizar
                  </Button>
                  {canUpdate ? (
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={() => router.push(`/autorizacoes/${record.id}/editar`)}
                      sx={{ color: 'text.primary', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      Editar
                    </Button>
                  ) : null}
                </Stack>
                {canRemove ? (
                  <IconButton
                    size="small"
                    color="error"
                    aria-label="Excluir autorização"
                    onClick={() => handleOpenDeleteConfirmation(record)}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                ) : null}
              </Stack>
            </Stack>
          </MobileListCard>
        ))
      )}
    </Stack>
  )
}
