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
import { RegisterServiceProviderButton } from '@/modules/prestadores-servicos/components/RegisterServiceProviderButton'
import { useServiceProviderListContext } from '@/modules/prestadores-servicos/context/ServiceProviderListContext'
import { ServiceProvidersMobileListLoader } from '@/modules/prestadores-servicos/mobile/ServiceProvidersMobileListLoader'
import { ListEmptyState } from '@/modules/table/components/ListEmptyState'
import { ListErrorState } from '@/modules/table/components/ListErrorState'
import { MobileFieldLabel, MobileListCard } from '@/styles/MobileList.styles'

const SKELETON_CARD_COUNT = 5

export function ServiceProvidersMobileList() {
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
  } = useServiceProviderListContext()
  const canUpdate = useCan('service-providers', 'update')
  const canRemove = useCan('service-providers', 'remove')

  return (
    <Stack spacing={3}>
      {isError ? (
        <ListErrorState
          title="Não foi possível carregar os prestadores de serviço."
          message={errorMessage}
          onRetry={onRetry}
        />
      ) : isLoading ? (
        Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
          <ServiceProvidersMobileListLoader key={index} />
        ))
      ) : records.length === 0 ? (
        <ListEmptyState
          title="Nenhum prestador de serviço encontrado."
          description="Nenhum registro corresponde à busca realizada. Ajuste os critérios ou cadastre um novo prestador."
          actions={
            <>
              <Button variant="outlined" onClick={handleClearFilters}>
                Limpar busca
              </Button>
              <RegisterServiceProviderButton />
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
                    {record.responsibleName}
                  </Typography>
                  {record.document ? (
                    <Typography variant="caption" color="text.disabled">
                      {record.document}
                    </Typography>
                  ) : null}
                </Stack>

                <Stack spacing={0.25}>
                  <MobileFieldLabel variant="caption">Empresa</MobileFieldLabel>
                  <Typography variant="body2" color="text.primary">
                    {record.companyName}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {record.serviceType}
                  </Typography>
                </Stack>

                <Stack spacing={0.25}>
                  <MobileFieldLabel variant="caption">Unidade</MobileFieldLabel>
                  <Typography variant="body2" color="text.primary">
                    {record.unit || '—'}
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
                        onClick={() => router.push(`/prestadores-servicos/${record.id}/editar`)}
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
                      aria-label="Excluir prestador de serviço"
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
