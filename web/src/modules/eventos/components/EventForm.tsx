'use client'

import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import NotesRoundedIcon from '@mui/icons-material/NotesRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MuiCard from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useFieldArray, useForm } from 'react-hook-form'

import type { CreateEventRequest } from '@/app/api/events/types'
import { TextField, TextFieldLabel, TextFieldStack } from '@/modules/form'

export type EventGuestFormValues = {
  id?: string
  name: string
  document: string
}

export type EventFormValues = {
  title: string
  date: string
  startTime: string
  endTime: string
  unit: string
  space: string
  responsibleName: string
  guests: EventGuestFormValues[]
  observations: string
}

const DEFAULT_EVENT_FORM_VALUES: EventFormValues = {
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  unit: '',
  space: '',
  responsibleName: '',
  guests: [{ name: '', document: '' }],
  observations: '',
}

export function mapEventFormValuesToPayload(values: EventFormValues): CreateEventRequest {
  return {
    title: values.title.trim(),
    date: values.date,
    startTime: values.startTime,
    endTime: values.endTime.trim() || undefined,
    unit: values.unit.trim(),
    space: values.space.trim() || undefined,
    responsibleName: values.responsibleName.trim(),
    guests: values.guests
      .filter((guest) => guest.name.trim() !== '')
      .map((guest) => ({
        id: guest.id || undefined,
        name: guest.name.trim(),
        document: guest.document.trim() || undefined,
      })),
    observations: values.observations.trim() || undefined,
  }
}

type EventFormProps = {
  defaultValues?: EventFormValues
  isSubmitting: boolean
  submitLabel: string
  onSubmit: (values: EventFormValues) => Promise<void> | void
  onCancel: () => void
}

export function EventForm({
  defaultValues,
  isSubmitting,
  submitLabel,
  onSubmit,
  onCancel,
}: EventFormProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({
    defaultValues: defaultValues ?? DEFAULT_EVENT_FORM_VALUES,
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'guests',
  })

  // React Hook Form's `watch()` é marcado como incompatible-library pelo React Compiler lint.
  // eslint-disable-next-line react-hooks/incompatible-library
  const guestsCount = watch('guests').filter((guest) => guest.name.trim() !== '').length

  return (
    <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)}>
      <MuiCard>
        <CardContent>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2} alignItems="center">
              <CelebrationRoundedIcon color="primary" fontSize="small" />
              <Typography variant="h4">Dados do Evento</Typography>
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldStack>
                  <TextFieldLabel required>Nome do evento</TextFieldLabel>
                  <TextField
                    required
                    error={Boolean(errors.title)}
                    helperText={errors.title?.message}
                    {...register('title', {
                      required: 'Informe o nome do evento',
                      minLength: {
                        value: 3,
                        message: 'Nome do evento deve ter ao menos 3 caracteres',
                      },
                    })}
                  />
                </TextFieldStack>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldStack>
                  <TextFieldLabel>Local</TextFieldLabel>
                  <TextField {...register('space')} />
                </TextFieldStack>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldStack>
                  <TextFieldLabel required>Unidade</TextFieldLabel>
                  <TextField
                    required
                    error={Boolean(errors.unit)}
                    helperText={errors.unit?.message}
                    {...register('unit', {
                      required: 'Informe a unidade',
                    })}
                  />
                </TextFieldStack>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldStack>
                  <TextFieldLabel required>Responsável pelo evento</TextFieldLabel>
                  <TextField
                    required
                    error={Boolean(errors.responsibleName)}
                    helperText={errors.responsibleName?.message}
                    {...register('responsibleName', {
                      required: 'Informe o responsável pelo evento',
                      minLength: {
                        value: 3,
                        message: 'Responsável deve ter ao menos 3 caracteres',
                      },
                    })}
                  />
                </TextFieldStack>
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </MuiCard>

      <MuiCard>
        <CardContent>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2} alignItems="center">
              <AccessTimeRoundedIcon color="primary" fontSize="small" />
              <Typography variant="h4">Data e Horário</Typography>
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextFieldStack>
                  <TextFieldLabel required>Data</TextFieldLabel>
                  <TextField
                    required
                    type="date"
                    error={Boolean(errors.date)}
                    helperText={errors.date?.message}
                    slotProps={{ inputLabel: { shrink: true } }}
                    {...register('date', {
                      required: 'Informe a data do evento',
                    })}
                  />
                </TextFieldStack>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextFieldStack>
                  <TextFieldLabel required>Hora inicial</TextFieldLabel>
                  <TextField
                    required
                    type="time"
                    error={Boolean(errors.startTime)}
                    helperText={errors.startTime?.message}
                    slotProps={{ inputLabel: { shrink: true } }}
                    {...register('startTime', {
                      required: 'Informe a hora inicial',
                    })}
                  />
                </TextFieldStack>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextFieldStack>
                  <TextFieldLabel>Hora final</TextFieldLabel>
                  <TextField
                    type="time"
                    slotProps={{ inputLabel: { shrink: true } }}
                    {...register('endTime')}
                  />
                </TextFieldStack>
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </MuiCard>

      <MuiCard>
        <CardContent>
          <Stack spacing={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              rowGap={2}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <GroupsRoundedIcon color="primary" fontSize="small" />
                <Typography variant="h4">Convidados</Typography>
              </Stack>

              <Typography variant="body2" color="text.secondary">
                {isMobile
                  ? `${guestsCount} na lista`
                  : `${guestsCount} convidado${guestsCount === 1 ? '' : 's'} na lista`}
              </Typography>
            </Stack>

            {isMobile ? (
              <Stack spacing={2.5}>
                <Divider sx={{ borderColor: 'divider' }} />

                {fields.map((guestField, index) => (
                  <Stack key={guestField.id} spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={700}
                        sx={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}
                      >
                        Convidado {index + 1}
                      </Typography>

                      {index > 0 ? (
                        <IconButton
                          aria-label="Remover convidado"
                          color="error"
                          size="small"
                          onClick={() => remove(index)}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      ) : null}
                    </Stack>

                    <TextFieldStack>
                      <TextFieldLabel>Nome</TextFieldLabel>
                      <TextField
                        placeholder="Nome do convidado"
                        aria-label="Nome do convidado"
                        error={Boolean(errors.guests?.[index]?.name)}
                        helperText={errors.guests?.[index]?.name?.message}
                        {...register(`guests.${index}.name`, {
                          validate: (value) =>
                            !value.trim() ||
                            value.trim().length >= 3 ||
                            'Nome do convidado deve ter ao menos 3 caracteres',
                        })}
                      />
                    </TextFieldStack>

                    <TextFieldStack>
                      <TextFieldLabel>CPF / RG</TextFieldLabel>
                      <TextField
                        placeholder="000.000.000-00"
                        aria-label="CPF ou RG do convidado"
                        {...register(`guests.${index}.document`)}
                      />
                    </TextFieldStack>

                    {index < fields.length - 1 ? <Divider sx={{ borderColor: 'divider' }} /> : null}
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1.5}>
                  <Box sx={{ width: 20 }} />
                  <Grid container spacing={2} sx={{ flex: 1 }}>
                    <Grid size={6}>
                      <TextFieldLabel
                        variant="caption"
                        sx={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}
                      >
                        Nome
                      </TextFieldLabel>
                    </Grid>
                    <Grid size={6}>
                      <TextFieldLabel
                        variant="caption"
                        sx={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}
                      >
                        CPF / RG
                      </TextFieldLabel>
                    </Grid>
                  </Grid>
                  <Box sx={{ width: 40 }} />
                </Stack>

                {fields.map((guestField, index) => (
                  <Stack key={guestField.id} direction="row" spacing={1.5} alignItems="center">
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontWeight={700}
                      sx={{ width: 20, textAlign: 'center', flexShrink: 0 }}
                    >
                      {index + 1}
                    </Typography>

                    <Grid container spacing={2} sx={{ flex: 1 }}>
                      <Grid size={6}>
                        <TextField
                          placeholder="Nome do convidado"
                          aria-label="Nome do convidado"
                          error={Boolean(errors.guests?.[index]?.name)}
                          helperText={errors.guests?.[index]?.name?.message}
                          {...register(`guests.${index}.name`, {
                            validate: (value) =>
                              !value.trim() ||
                              value.trim().length >= 3 ||
                              'Nome do convidado deve ter ao menos 3 caracteres',
                          })}
                        />
                      </Grid>

                      <Grid size={6}>
                        <TextField
                          placeholder="000.000.000-00"
                          aria-label="CPF ou RG do convidado"
                          {...register(`guests.${index}.document`)}
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ width: 40, display: 'flex', justifyContent: 'flex-end' }}>
                      {index > 0 ? (
                        <IconButton
                          aria-label="Remover convidado"
                          color="error"
                          onClick={() => remove(index)}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      ) : null}
                    </Box>
                  </Stack>
                ))}
              </Stack>
            )}

            <Button
              variant="outlined"
              color="inherit"
              startIcon={<AddRoundedIcon fontSize="small" />}
              onClick={() => append({ name: '', document: '' })}
              sx={{
                alignSelf: { xs: 'stretch', sm: 'flex-start' },
                width: { xs: '100%', sm: 'auto' },
                color: 'text.primary',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                fontWeight: 700,
              }}
            >
              Adicionar convidado
            </Button>

            <Typography variant="caption" color="text.secondary">
              Convidados sem nome preenchido são ignorados ao salvar.
            </Typography>
          </Stack>
        </CardContent>
      </MuiCard>

      <MuiCard>
        <CardContent>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={2} alignItems="center">
              <NotesRoundedIcon color="primary" fontSize="small" />
              <Typography variant="h4">Observações</Typography>
            </Stack>

            <TextFieldStack>
              <TextFieldLabel>Observações</TextFieldLabel>
              <TextField multiline minRows={3} {...register('observations')} />
            </TextFieldStack>
          </Stack>
        </CardContent>
      </MuiCard>

      <Stack
        direction={{ xs: 'column-reverse', sm: 'row' }}
        justifyContent="flex-end"
        spacing={1.5}
        sx={{
          pt: 2,
          pb: { xs: 2, sm: 0 },
          borderTop: '1px solid',
          borderColor: 'rgba(255, 255, 255, 0.06)',
          position: { xs: 'sticky', sm: 'static' },
          bottom: 0,
          bgcolor: 'background.default',
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={onCancel}
          disabled={isSubmitting}
          sx={{
            color: 'text.primary',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          variant="contained"
          color="success"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          {isSubmitting ? 'Salvando...' : submitLabel}
        </Button>
      </Stack>
    </Stack>
  )
}
