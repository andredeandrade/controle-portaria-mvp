'use client'

import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/navigation'

import { useCan } from '@/hooks/useCan'
import { RegisterOccurrenceButton } from '@/modules/ocorrencias/components/RegisterOccurrenceButton'
import { useOccurrenceListContext } from '@/modules/ocorrencias/context/OccurrenceListContext'
import { OccurrencesMobileListLoader } from '@/modules/ocorrencias/mobile/OccurrencesMobileListLoader'
import { ListEmptyState } from '@/modules/table/components/ListEmptyState'
import { ListErrorState } from '@/modules/table/components/ListErrorState'
import { MobileFieldLabel, MobileListCard } from '@/styles/MobileList.styles'

const SKELETON_CARD_COUNT = 5

export function OccurrencesMobileList() {
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
  } = useOccurrenceListContext()
  const canUpdate = useCan('incidents', 'update')
  const canRemove = useCan('incidents', 'remove')

  const handleEdit = (id: string) => {
    router.push(`/ocorrencias/${id}/editar`)
  }

  return (
    <Stack spacing={3}>
      {isError ? (
        <ListErrorState
          title="Não foi possível carregar as ocorrências."
          message={errorMessage}
          onRetry={onRetry}
        />
      ) : isLoading ? (
        Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
          <OccurrencesMobileListLoader key={index} />
        ))
      ) : records.length === 0 ? (
        <ListEmptyState
          title="Nenhuma ocorrência encontrada."
          description="Nenhum registro corresponde à busca realizada. Ajuste os critérios ou registre uma nova ocorrência."
          actions={
            <>
              <Button variant="outlined" onClick={handleClearFilters}>
                Limpar busca
              </Button>
              <RegisterOccurrenceButton />
            </>
          }
        />
      ) : (
        records.map((record) => (
          <MobileListCard key={record.id} variant="outlined" sx={{ p: 5 }}>
            <Stack spacing={5}>
              <Stack spacing={0.25}>
                <Typography variant="body1" fontWeight={700} color="text.primary">
                  {record.occurrenceTypeLabel}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {record.place}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={2}>
                <Stack spacing={0.25}>
                  <MobileFieldLabel variant="caption">Data</MobileFieldLabel>
                  <Typography variant="body2" color="text.primary">
                    {record.date}
                  </Typography>
                </Stack>
                <Stack spacing={0.25}>
                  <MobileFieldLabel variant="caption">Hora</MobileFieldLabel>
                  <Typography variant="body2" color="text.primary">
                    {record.time}
                  </Typography>
                </Stack>
              </Stack>

              <Stack spacing={0.25}>
                <MobileFieldLabel variant="caption">Registrado por</MobileFieldLabel>
                <Typography variant="body2" color="text.primary">
                  {record.createdByUserName}
                </Typography>
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
                      onClick={() => handleEdit(record.id)}
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
                    aria-label="Excluir ocorrência"
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
