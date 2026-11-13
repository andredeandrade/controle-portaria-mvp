'use client'

import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded'
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded'
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded'
import Button from '@mui/material/Button'
import MuiCard from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Controller, useForm } from 'react-hook-form'

import type { CreateAuthorizationRequest } from '@/app/api/authorizations/types'
import {
  PERSON_TYPE_OPTIONS,
  type PersonTypeValue,
  TextField,
  TextFieldLabel,
  TextFieldStack,
} from '@/modules/form'

const AUTHORIZATION_PERSON_TYPE_OPTIONS = PERSON_TYPE_OPTIONS.filter(
  (option) => option.value === 'visitante' || option.value === 'prestador_servico',
)

export type AuthorizationFormValues = {
  authorizedName: string
  personType: PersonTypeValue | ''
  document: string
  phone: string
  company?: string
  unit: string
  authorizedBy: string
  validFromDate: string
  validFromTime: string
  validToDate: string
  validToTime: string
  observations: string
}

const DEFAULT_AUTHORIZATION_FORM_VALUES: AuthorizationFormValues = {
  authorizedName: '',
  personType: '',
  document: '',
  phone: '',
  company: '',
  unit: '',
  authorizedBy: '',
  validFromDate: '',
  validFromTime: '',
  validToDate: '',
  validToTime: '',
  observations: '',
}

export function mapAuthorizationFormValuesToPayload(
  values: AuthorizationFormValues,
): CreateAuthorizationRequest {
  return {
    authorizedName: values.authorizedName.trim(),
    personType: values.personType,
    document: values.document.trim(),
    phone: values.phone.trim() || undefined,
    company: values.company?.trim() || undefined,
    unit: values.unit.trim(),
    authorizedBy: values.authorizedBy.trim(),
    validFromDate: values.validFromDate,
    validFromTime: values.validFromTime,
    validToDate: values.validToDate,
    validToTime: values.validToTime,
    observations: values.observations.trim() || undefined,
  }
}

type AuthorizationFormProps = {
  defaultValues?: AuthorizationFormValues
  isSubmitting: boolean
  submitLabel: string
  onSubmit: (values: AuthorizationFormValues) => Promise<void> | void
  onCancel: () => void
}

export function AuthorizationForm({
  defaultValues,
  isSubmitting,
  submitLabel,
  onSubmit,
  onCancel,
}: AuthorizationFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AuthorizationFormValues>({
    defaultValues: defaultValues ?? DEFAULT_AUTHORIZATION_FORM_VALUES,
  })

  return (
    <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)}>
      <MuiCard>
        <CardContent>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <BadgeRoundedIcon color="primary" fontSize="small" />
              <Typography variant="h4">Dados da Pessoa</Typography>
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldStack>
                  <TextFieldLabel required>Nome do autorizado</TextFieldLabel>
                  <TextField
                    required
                    error={Boolean(errors.authorizedName)}
                    helperText={errors.authorizedName?.message}
                    {...register('authorizedName', {
                      required: 'Informe o nome do autorizado',
                      minLength: {
                        value: 3,
                        message: 'Nome deve ter ao menos 3 caracteres',
                      },
                    })}
                  />
                </TextFieldStack>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldStack>
                  <TextFieldLabel required>Tipo de pessoa</TextFieldLabel>
                  <Controller
                    control={control}
                    name="personType"
                    rules={{ required: 'Selecione o tipo de pessoa' }}
                    render={({ field }) => (
                      <TextField
                        select
                        required
                        error={Boolean(errors.personType)}
                        helperText={errors.personType?.message}
                        {...field}
                        value={field.value ?? ''}
                        SelectProps={{ displayEmpty: true }}
                      >
                        <MenuItem value="" disabled>
                          Selecione
                        </MenuItem>
                        {AUTHORIZATION_PERSON_TYPE_OPTIONS.map((option) => (
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
                  <TextFieldLabel required>Documento</TextFieldLabel>
                  <TextField
                    required
                    error={Boolean(errors.document)}
                    helperText={errors.document?.message}
                    {...register('document', {
                      required: 'Informe o documento',
                      minLength: {
                        value: 5,
                        message: 'Documento deve ter ao menos 5 caracteres',
                      },
                    })}
                  />
                </TextFieldStack>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldStack>
                  <TextFieldLabel>Telefone</TextFieldLabel>
                  <TextField {...register('phone')} />
                </TextFieldStack>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldStack>
                  <TextFieldLabel>Empresa</TextFieldLabel>
                  <TextField {...register('company')} />
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
              <VerifiedUserRoundedIcon color="primary" fontSize="small" />
              <Typography variant="h4">Autorização</Typography>
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldStack>
                  <TextFieldLabel required>Unidade / Proprietário responsável</TextFieldLabel>
                  <TextField
                    required
                    error={Boolean(errors.unit)}
                    helperText={errors.unit?.message}
                    {...register('unit', { required: 'Informe a unidade ou responsável' })}
                  />
                </TextFieldStack>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldStack>
                  <TextFieldLabel required>Autorizado por</TextFieldLabel>
                  <TextField
                    required
                    error={Boolean(errors.authorizedBy)}
                    helperText={errors.authorizedBy?.message}
                    {...register('authorizedBy', {
                      required: 'Informe quem autorizou',
                      minLength: {
                        value: 3,
                        message: 'Autorizado por deve ter ao menos 3 caracteres',
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
            <Stack direction="row" spacing={1} alignItems="center">
              <EventAvailableRoundedIcon color="primary" fontSize="small" />
              <Typography variant="h4">Período de Validade</Typography>
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldStack>
                  <TextFieldLabel required>Data inicial</TextFieldLabel>
                  <TextField
                    required
                    type="date"
                    error={Boolean(errors.validFromDate)}
                    helperText={errors.validFromDate?.message}
                    slotProps={{ inputLabel: { shrink: true } }}
                    {...register('validFromDate', { required: 'Informe a data inicial' })}
                  />
                </TextFieldStack>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldStack>
                  <TextFieldLabel required>Hora inicial</TextFieldLabel>
                  <TextField
                    required
                    type="time"
                    error={Boolean(errors.validFromTime)}
                    helperText={errors.validFromTime?.message}
                    slotProps={{ inputLabel: { shrink: true } }}
                    {...register('validFromTime', { required: 'Informe a hora inicial' })}
                  />
                </TextFieldStack>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldStack>
                  <TextFieldLabel required>Data final</TextFieldLabel>
                  <TextField
                    required
                    type="date"
                    error={Boolean(errors.validToDate)}
                    helperText={errors.validToDate?.message}
                    slotProps={{ inputLabel: { shrink: true } }}
                    {...register('validToDate', {
                      required: 'Informe a data final',
                      validate: (value, formValues) => {
                        if (!formValues.validFromDate) {
                          return true
                        }

                        return (
                          value >= formValues.validFromDate ||
                          'Data final deve ser maior ou igual a data inicial'
                        )
                      },
                    })}
                  />
                </TextFieldStack>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldStack>
                  <TextFieldLabel required>Hora final</TextFieldLabel>
                  <TextField
                    required
                    type="time"
                    error={Boolean(errors.validToTime)}
                    helperText={errors.validToTime?.message}
                    slotProps={{ inputLabel: { shrink: true } }}
                    {...register('validToTime', {
                      required: 'Informe a hora final',
                      validate: (value, formValues) => {
                        if (!formValues.validFromDate || !formValues.validFromTime) {
                          return true
                        }

                        if (formValues.validToDate > formValues.validFromDate) {
                          return true
                        }

                        if (formValues.validToDate < formValues.validFromDate) {
                          return 'Período final deve ser maior ou igual ao período inicial'
                        }

                        return (
                          value >= formValues.validFromTime ||
                          'Período final deve ser maior ou igual ao período inicial'
                        )
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
            <Stack direction="row" spacing={1} alignItems="center">
              <DescriptionRoundedIcon color="primary" fontSize="small" />
              <Typography variant="h4">Observações</Typography>
            </Stack>

            <TextFieldStack>
              <TextFieldLabel>Observações</TextFieldLabel>
              <TextField multiline minRows={4} {...register('observations')} />
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
          type="button"
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
