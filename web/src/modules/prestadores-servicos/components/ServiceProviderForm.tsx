'use client'

import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import NotesRoundedIcon from '@mui/icons-material/NotesRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import Button from '@mui/material/Button'
import MuiCard from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useForm } from 'react-hook-form'

import type { CreateServiceProviderRequest } from '@/app/api/service-providers/types'
import { TextField, TextFieldLabel, TextFieldStack } from '@/modules/form'

export type ServiceProviderFormValues = {
  responsibleName: string
  document: string
  companyName: string
  serviceType: string
  phone: string
  email: string
  unit: string
  authorizedBy: string
  vehiclePlate: string
  vehicleBrandModel: string
  vehicleColor: string
  observations: string
}

const DEFAULT_SERVICE_PROVIDER_FORM_VALUES: ServiceProviderFormValues = {
  responsibleName: '',
  document: '',
  companyName: '',
  serviceType: '',
  phone: '',
  email: '',
  unit: '',
  authorizedBy: '',
  vehiclePlate: '',
  vehicleBrandModel: '',
  vehicleColor: '',
  observations: '',
}

export function mapServiceProviderFormValuesToPayload(
  values: ServiceProviderFormValues,
): CreateServiceProviderRequest {
  return {
    responsibleName: values.responsibleName.trim(),
    document: values.document.trim(),
    companyName: values.companyName.trim(),
    serviceType: values.serviceType.trim(),
    phone: values.phone.trim() || undefined,
    email: values.email.trim() || undefined,
    unit: values.unit.trim() || undefined,
    authorizedBy: values.authorizedBy.trim(),
    observations: values.observations.trim() || undefined,
    vehiclePlate: values.vehiclePlate.trim() || undefined,
    vehicleBrandModel: values.vehicleBrandModel.trim() || undefined,
    vehicleColor: values.vehicleColor.trim() || undefined,
  }
}

type ServiceProviderFormProps = {
  defaultValues?: ServiceProviderFormValues
  isSubmitting: boolean
  submitLabel: string
  onSubmit: (values: ServiceProviderFormValues) => Promise<void> | void
  onCancel: () => void
}

export function ServiceProviderForm({
  defaultValues,
  isSubmitting,
  submitLabel,
  onSubmit,
  onCancel,
}: ServiceProviderFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceProviderFormValues>({
    defaultValues: defaultValues ?? DEFAULT_SERVICE_PROVIDER_FORM_VALUES,
  })

  return (
    <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)}>
      <MuiCard>
        <CardContent>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <PersonRoundedIcon color="primary" fontSize="small" />
              <Typography variant="h4">Dados do Prestador</Typography>
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldStack>
                  <TextFieldLabel required>Nome</TextFieldLabel>
                  <TextField
                    required
                    error={Boolean(errors.responsibleName)}
                    helperText={errors.responsibleName?.message}
                    {...register('responsibleName', {
                      required: 'Informe o nome do responsável',
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
                  <TextFieldLabel required>CNPJ/CPF</TextFieldLabel>
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
                  <TextFieldLabel required>Empresa</TextFieldLabel>
                  <TextField
                    required
                    error={Boolean(errors.companyName)}
                    helperText={errors.companyName?.message}
                    {...register('companyName', {
                      required: 'Informe o nome da empresa',
                      minLength: {
                        value: 2,
                        message: 'Nome da empresa deve ter ao menos 2 caracteres',
                      },
                    })}
                  />
                </TextFieldStack>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldStack>
                  <TextFieldLabel required>Tipo de serviço</TextFieldLabel>
                  <TextField
                    required
                    error={Boolean(errors.serviceType)}
                    helperText={errors.serviceType?.message}
                    {...register('serviceType', {
                      required: 'Informe o tipo de serviço',
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
                  <TextFieldLabel>E-mail</TextFieldLabel>
                  <TextField
                    type="email"
                    error={Boolean(errors.email)}
                    helperText={errors.email?.message}
                    {...register('email', {
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Informe um e-mail valido',
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
              <HomeRoundedIcon color="primary" fontSize="small" />
              <Typography variant="h4">Unidade e Autorização</Typography>
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldStack>
                  <TextFieldLabel>Unidade</TextFieldLabel>
                  <TextField {...register('unit')} />
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
                      required: 'Informe o responsável pela autorização',
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
              <DirectionsCarRoundedIcon color="primary" fontSize="small" />
              <Typography variant="h4">Veículo</Typography>
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextFieldStack>
                  <TextFieldLabel>Placa</TextFieldLabel>
                  <TextField {...register('vehiclePlate')} />
                </TextFieldStack>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextFieldStack>
                  <TextFieldLabel>Marca - Modelo</TextFieldLabel>
                  <TextField {...register('vehicleBrandModel')} />
                </TextFieldStack>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextFieldStack>
                  <TextFieldLabel>Cor</TextFieldLabel>
                  <TextField {...register('vehicleColor')} />
                </TextFieldStack>
              </Grid>
            </Grid>

            <Typography variant="body2" color="text.secondary">
              Deixe em branco se o prestador entrar a pé.
            </Typography>
          </Stack>
        </CardContent>
      </MuiCard>

      <MuiCard>
        <CardContent>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1} alignItems="center">
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
