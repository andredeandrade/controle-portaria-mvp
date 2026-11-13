'use client'

import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded'
import Button from '@mui/material/Button'
import MuiCard from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Controller, useForm } from 'react-hook-form'

import type { CreateIncidentRequest } from '@/app/api/incidents/types'
import { TextField, TextFieldLabel, TextFieldStack } from '@/modules/form'
import { OCCURRENCE_TYPE_OPTIONS, type OccurrenceTypeEnum } from '@/types/ocorrencias'

export type OccurrenceFormValues = {
  occurrenceType: OccurrenceTypeEnum | ''
  date: string
  time: string
  place: string
  report: string
}

const DEFAULT_OCCURRENCE_FORM_VALUES: OccurrenceFormValues = {
  occurrenceType: '',
  date: '',
  time: '',
  place: '',
  report: '',
}

export function mapOccurrenceFormValuesToPayload(
  values: OccurrenceFormValues,
): CreateIncidentRequest {
  return {
    occurrenceType: values.occurrenceType,
    date: values.date,
    time: values.time,
    place: values.place.trim(),
    report: values.report.trim(),
  }
}

type OccurrenceFormProps = {
  defaultValues?: OccurrenceFormValues
  isSubmitting: boolean
  submitLabel: string
  onSubmit: (values: OccurrenceFormValues) => Promise<void> | void
  onCancel: () => void
}

export function OccurrenceForm({
  defaultValues,
  isSubmitting,
  submitLabel,
  onSubmit,
  onCancel,
}: OccurrenceFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OccurrenceFormValues>({
    defaultValues: defaultValues ?? DEFAULT_OCCURRENCE_FORM_VALUES,
  })

  return (
    <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)}>
      <MuiCard>
        <CardContent>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <ReportProblemRoundedIcon color="primary" fontSize="small" />
              <Typography variant="h4">Dados da Ocorrência</Typography>
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldStack>
                  <TextFieldLabel required>Tipo de ocorrência</TextFieldLabel>
                  <Controller
                    control={control}
                    name="occurrenceType"
                    rules={{ required: 'Selecione o tipo de ocorrência' }}
                    render={({ field }) => (
                      <TextField
                        select
                        required
                        error={Boolean(errors.occurrenceType)}
                        helperText={errors.occurrenceType?.message}
                        {...field}
                        value={field.value ?? ''}
                        SelectProps={{ displayEmpty: true }}
                      >
                        <MenuItem value="" disabled>
                          Selecione
                        </MenuItem>
                        {OCCURRENCE_TYPE_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </TextFieldStack>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldStack>
                  <TextFieldLabel required>Local</TextFieldLabel>
                  <TextField
                    required
                    error={Boolean(errors.place)}
                    helperText={errors.place?.message}
                    {...register('place', {
                      required: 'Informe o local da ocorrência',
                    })}
                  />
                </TextFieldStack>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldStack>
                  <TextFieldLabel required>Data</TextFieldLabel>
                  <TextField
                    required
                    type="date"
                    error={Boolean(errors.date)}
                    helperText={errors.date?.message}
                    slotProps={{ inputLabel: { shrink: true } }}
                    {...register('date', {
                      required: 'Informe a data',
                    })}
                  />
                </TextFieldStack>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldStack>
                  <TextFieldLabel required>Hora</TextFieldLabel>
                  <TextField
                    required
                    type="time"
                    error={Boolean(errors.time)}
                    helperText={errors.time?.message}
                    slotProps={{ inputLabel: { shrink: true } }}
                    {...register('time', {
                      required: 'Informe a hora',
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
            <Stack direction="row" spacing={1} alignItems="center">
              <DescriptionRoundedIcon color="primary" fontSize="small" />
              <Typography variant="h4">Relato</Typography>
            </Stack>

            <TextFieldStack>
              <TextFieldLabel required>Relato da ocorrência</TextFieldLabel>
              <TextField
                required
                multiline
                minRows={4}
                error={Boolean(errors.report)}
                helperText={errors.report?.message}
                {...register('report', {
                  required: 'Informe o relato da ocorrência',
                  minLength: {
                    value: 5,
                    message: 'Relato deve ter ao menos 5 caracteres',
                  },
                })}
              />
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
