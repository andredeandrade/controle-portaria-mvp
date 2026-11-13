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
import { RegisterEventButton } from '@/modules/eventos/components/RegisterEventButton'
import { useEventListContext } from '@/modules/eventos/context/EventListContext'
import { EventsMobileListLoader } from '@/modules/eventos/mobile/EventsMobileListLoader'
import { ListEmptyState } from '@/modules/table/components/ListEmptyState'
import { ListErrorState } from '@/modules/table/components/ListErrorState'
import { MobileFieldLabel, MobileListCard } from '@/styles/MobileList.styles'

const SKELETON_CARD_COUNT = 5

export function EventsMobileList() {
  const router = useRouter()
  const {
    records,
    isLoading,
    isError,
    errorMessage,
    refetch: onRetry,
    handleClearFilters,
    handleOpenDeleteConfirmation,
  } = useEventListContext()
  const canUpdate = useCan('events', 'update')
  const canRemove = useCan('events', 'remove')

  return (
    <Stack spacing={3}>
      {isError ? (
        <ListErrorState
          title="Não foi possível carregar os eventos."
          message={errorMessage}
          onRetry={onRetry}
        />
      ) : isLoading ? (
        Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
          <EventsMobileListLoader key={index} />
        ))
      ) : records.length === 0 ? (
        <ListEmptyState
          title="Nenhum evento encontrado."
          description="Nenhum registro corresponde à busca realizada. Ajuste os critérios ou registre um novo evento."
          actions={
            <>
              <Button variant="outlined" onClick={handleClearFilters}>
                Limpar busca
              </Button>
              <RegisterEventButton />
            </>
          }
        />
      ) : (
        records.map((record) => (
          <MobileListCard key={record.id} variant="outlined" sx={{ p: 5 }}>
            <Stack spacing={5}>
              <Stack spacing={0.25}>
                <Typography variant="body1" fontWeight={700} color="text.primary">
                  {record.title}
                </Typography>
                {record.space ? (
                  <Typography variant="caption" color="text.disabled">
                    {record.space}
                  </Typography>
                ) : null}
              </Stack>

              <Grid container spacing={3}>
                <Grid size={6}>
                  <Stack spacing={0.25}>
                    <MobileFieldLabel variant="caption">Data</MobileFieldLabel>
                    <Typography variant="body2" color="text.primary">
                      {record.date}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid size={6}>
                  <Stack spacing={0.25}>
                    <MobileFieldLabel variant="caption">Horário</MobileFieldLabel>
                    <Typography variant="body2" color="text.primary">
                      {record.time}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid size={6}>
                  <Stack spacing={0.25}>
                    <MobileFieldLabel variant="caption">Unidade</MobileFieldLabel>
                    <Typography variant="body2" color="text.primary">
                      {record.unit}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid size={6}>
                  <Stack spacing={0.25}>
                    <MobileFieldLabel variant="caption">Convidados</MobileFieldLabel>
                    <Typography variant="body2" color="text.primary">
                      {record.guestsCount} convidado{record.guestsCount === 1 ? '' : 's'}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>

              <Stack spacing={0.25}>
                <MobileFieldLabel variant="caption">Responsável</MobileFieldLabel>
                <Typography variant="body2" color="text.primary">
                  {record.responsibleName}
                </Typography>
              </Stack>

              <Divider sx={{ borderColor: 'divider' }} />

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => router.push(`/eventos/${record.id}`)}
                  >
                    Visualizar
                  </Button>
                  {canUpdate ? (
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={() => router.push(`/eventos/${record.id}/editar`)}
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
                    aria-label="Excluir evento"
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
