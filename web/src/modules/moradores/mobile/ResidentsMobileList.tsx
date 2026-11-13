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
import { RegisterResidentButton } from '@/modules/moradores/components/RegisterResidentButton'
import { useResidentListContext } from '@/modules/moradores/context/ResidentListContext'
import { ResidentsMobileListLoader } from '@/modules/moradores/mobile/ResidentsMobileListLoader'
import {
  DEFAULT_RESIDENT_CATEGORY_CHIP_COLOR,
  residentCategoryChipColor,
} from '@/modules/moradores/styles/ResidentStyles'
import { ListEmptyState } from '@/modules/table/components/ListEmptyState'
import { ListErrorState } from '@/modules/table/components/ListErrorState'
import { MobileFieldLabel, MobileListCard } from '@/styles/MobileList.styles'

const SKELETON_CARD_COUNT = 5

export function ResidentsMobileList() {
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
  } = useResidentListContext()
  const canUpdate = useCan('residents', 'update')
  const canRemove = useCan('residents', 'remove')

  return (
    <Stack spacing={3}>
      {isError ? (
        <ListErrorState
          title="Não foi possível carregar os moradores."
          message={errorMessage}
          onRetry={onRetry}
        />
      ) : isLoading ? (
        Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
          <ResidentsMobileListLoader key={index} />
        ))
      ) : records.length === 0 ? (
        <ListEmptyState
          title="Nenhum morador encontrado."
          description="Nenhum registro corresponde à busca realizada. Ajuste os critérios ou cadastre um novo morador."
          actions={
            <>
              <Button variant="outlined" onClick={handleClearFilters}>
                Limpar busca
              </Button>
              <RegisterResidentButton />
            </>
          }
        />
      ) : (
        records.map((record) => {
          const chipColor =
            residentCategoryChipColor[record.relation.toLowerCase()] ??
            DEFAULT_RESIDENT_CATEGORY_CHIP_COLOR

          return (
            <MobileListCard key={record.id} variant="outlined" sx={{ p: 5 }}>
              <Stack spacing={5}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  spacing={1}
                >
                  <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                    <Typography variant="body1" fontWeight={700} color="text.primary">
                      {record.name}
                    </Typography>
                    {record.document ? (
                      <Typography variant="caption" color="text.disabled">
                        CPF: {record.document}
                      </Typography>
                    ) : null}
                  </Stack>
                  <Chip
                    label={record.relation}
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

                <Stack spacing={0.25}>
                  <MobileFieldLabel variant="caption">
                    {record.units.length > 1 ? 'Unidades' : 'Unidade'}
                  </MobileFieldLabel>
                  <Typography variant="body2" color="text.primary">
                    {record.units.join(', ') || '-'}
                  </Typography>
                </Stack>

                <Stack spacing={0.5}>
                  <MobileFieldLabel variant="caption">Veículos</MobileFieldLabel>
                  {record.vehicles.length > 0 ? (
                    <Stack direction="row" spacing={0.75} flexWrap="wrap">
                      {record.vehicles.map((vehicle, index) => (
                        <Chip
                          key={`${record.id}-${vehicle.plate}-${index}`}
                          label={vehicle.plate}
                          size="small"
                          variant="outlined"
                          sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 600 }}
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.disabled">
                      —
                    </Typography>
                  )}
                </Stack>

                <Divider sx={{ borderColor: 'divider' }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpenView(record)}
                    >
                      Visualizar
                    </Button>
                    {canUpdate ? (
                      <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => router.push(`/moradores/${record.id}/editar`)}
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
                      aria-label="Excluir morador"
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
