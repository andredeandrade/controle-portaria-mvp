'use client'

import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded'
import MuiCard from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { Event } from '@/app/api/events/types'
import { TextField, TextFieldLabel, TextFieldStack } from '@/modules/form'

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('pt-BR').format(date)
}

type EventDetailsCardProps = {
  event: Event
}

export function EventDetailsCard({ event }: EventDetailsCardProps) {
  return (
    <MuiCard>
      <CardContent>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={2} alignItems="center">
            <CelebrationRoundedIcon color="primary" fontSize="small" />
            <Typography variant="h4">Dados do Evento</Typography>
          </Stack>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextFieldStack>
                <TextFieldLabel>Local</TextFieldLabel>
                <TextField value={event.space ?? '—'} slotProps={{ input: { readOnly: true } }} />
              </TextFieldStack>
            </Grid>

            <Grid size={{ xs: 6, sm: 6, md: 4 }}>
              <TextFieldStack>
                <TextFieldLabel>Unidade</TextFieldLabel>
                <TextField value={event.unit} slotProps={{ input: { readOnly: true } }} />
              </TextFieldStack>
            </Grid>

            <Grid size={{ xs: 6, sm: 6, md: 4 }}>
              <TextFieldStack>
                <TextFieldLabel>Data</TextFieldLabel>
                <TextField
                  value={formatDate(event.date)}
                  slotProps={{
                    input: {
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarMonthRoundedIcon color="primary" fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </TextFieldStack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextFieldStack>
                <TextFieldLabel>Responsável pelo evento</TextFieldLabel>
                <TextField value={event.responsibleName} slotProps={{ input: { readOnly: true } }} />
              </TextFieldStack>
            </Grid>

            <Grid size={{ xs: 6, sm: 6, md: 4 }}>
              <TextFieldStack>
                <TextFieldLabel>Hora inicial</TextFieldLabel>
                <TextField
                  value={event.startTime}
                  slotProps={{
                    input: {
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTimeRoundedIcon color="primary" fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </TextFieldStack>
            </Grid>

            <Grid size={{ xs: 6, sm: 6, md: 4 }}>
              <TextFieldStack>
                <TextFieldLabel>Hora final</TextFieldLabel>
                <TextField
                  value={event.endTime ?? 'Não definida'}
                  slotProps={{
                    input: {
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTimeRoundedIcon color="primary" fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </TextFieldStack>
            </Grid>
          </Grid>
        </Stack>
      </CardContent>
    </MuiCard>
  )
}
