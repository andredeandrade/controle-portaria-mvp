'use client'

import NotesRoundedIcon from '@mui/icons-material/NotesRounded'
import MuiCard from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { Event } from '@/app/api/events/types'
import { TextField } from '@/modules/form'

type EventObservationsCardProps = {
  event: Event
}

export function EventObservationsCard({ event }: EventObservationsCardProps) {
  return (
    <MuiCard>
      <CardContent>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={2} alignItems="center">
            <NotesRoundedIcon color="primary" fontSize="small" />
            <Typography variant="h4">Observações</Typography>
          </Stack>

          <TextField
            value={event.observations || 'Nenhuma observação registrada.'}
            multiline
            minRows={3}
            slotProps={{ input: { readOnly: true } }}
          />
        </Stack>
      </CardContent>
    </MuiCard>
  )
}
