'use client'

import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/navigation'

import { useCan } from '@/hooks/useCan'
import { RegisterVisitorButton } from '@/modules/visitantes/components/RegisterVisitorButton'
import { useVisitorListContext } from '@/modules/visitantes/context/VisitorListContext'
import { VisitorsMobileListLoader } from '@/modules/visitantes/mobile/VisitorsMobileListLoader'
import { ListEmptyState } from '@/modules/table/components/ListEmptyState'
import { ListErrorState } from '@/modules/table/components/ListErrorState'
import { MobileFieldLabel, MobileListCard } from '@/styles/MobileList.styles'

const SKELETON_CARD_COUNT = 5

export function VisitorsMobileList() {
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
  } = useVisitorListContext()
  const canUpdate = useCan('visitors', 'update')
  const canRemove = useCan('visitors', 'remove')

  return (
    <Stack spacing={3}>
      {isError ? (
        <ListErrorState
          title="Não foi possível carregar os visitantes."
          message={errorMessage}
          onRetry={onRetry}
        />
      ) : isLoading ? (
        Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
          <VisitorsMobileListLoader key={index} />
        ))
      ) : records.length === 0 ? (
        <ListEmptyState
          title="Nenhum visitante encontrado."
          description="Nenhum registro corresponde à busca realizada. Ajuste os critérios ou cadastre um novo visitante."
          actions={
            <>
              <Button variant="outlined" onClick={handleClearFilters}>
                Limpar busca
              </Button>
              <RegisterVisitorButton />
            </>
          }
        />
      ) : (
        records.map((record) => {
          const hasVehicle = Boolean(
            record.vehiclePlate || record.vehicleBrandModel || record.vehicleColor,
          )
          const vehicleDescription = [record.vehicleBrandModel, record.vehicleColor]
            .filter(Boolean)
            .join(' ')

          return (
            <MobileListCard key={record.id} variant="outlined" sx={{ p: 5 }}>
              <Stack spacing={5}>
                <Stack spacing={0.25}>
                  <Typography variant="body1" fontWeight={700} color="text.primary">
                    {record.name}
                  </Typography>
                  {record.document ? (
                    <Typography variant="caption" color="text.disabled">
                      {record.document}
                    </Typography>
                  ) : null}
                </Stack>

                <Stack spacing={0.25}>
                  <MobileFieldLabel variant="caption">Autorizado por</MobileFieldLabel>
                  <Typography variant="body2" color="text.primary">
                    {record.authorizedBy}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {record.unit}
                  </Typography>
                </Stack>

                <Stack spacing={0.25}>
                  <MobileFieldLabel variant="caption">Telefone</MobileFieldLabel>
                  <Typography variant="body2" color="text.primary">
                    {record.phone}
                  </Typography>
                </Stack>

                <Stack spacing={0.5}>
                  <MobileFieldLabel variant="caption">Veículo</MobileFieldLabel>
                  {hasVehicle ? (
                    <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                      {record.vehiclePlate ? (
                        <Chip
                          label={record.vehiclePlate}
                          size="small"
                          variant="outlined"
                          sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 600 }}
                        />
                      ) : null}
                      {vehicleDescription ? (
                        <Typography variant="body2" color="text.secondary">
                          {vehicleDescription}
                        </Typography>
                      ) : null}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.disabled">
                      Nenhum veículo cadastrado
                    </Typography>
                  )}
                </Stack>

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
                        onClick={() => router.push(`/visitantes/${record.id}/editar`)}
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
                      aria-label="Excluir visitante"
                      onClick={() => handleOpenDeleteConfirmation(record)}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  ) : null}
                </Stack>
              </Stack>
            </MobileListCard>
          )
        })
      )}
    </Stack>
  )
}
