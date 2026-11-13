'use client'

import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import NotesRoundedIcon from '@mui/icons-material/NotesRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import Button from '@mui/material/Button'
import MuiCard from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Controller, useFieldArray, useForm } from 'react-hook-form'

import type { CreateResidentRequest } from '@/app/api/residents/types'
import {
  type ColorValue,
  ColorSelect,
  TextField,
  TextFieldLabel,
  TextFieldStack,
} from '@/modules/form'

export const RESIDENT_RELATION_OPTIONS = [
  { label: 'Proprietário', value: 'proprietario' },
  { label: 'Inquilino', value: 'inquilino' },
  { label: 'Dependente', value: 'dependente' },
] as const

export const VEHICLE_TYPE_OPTIONS = [
  { label: 'Carro', value: 'carro' },
  { label: 'Moto', value: 'moto' },
  { label: 'Outro', value: 'outro' },
] as const

export type ResidentRelationValue = (typeof RESIDENT_RELATION_OPTIONS)[number]['value']
export type VehicleTypeValue = (typeof VEHICLE_TYPE_OPTIONS)[number]['value']

export type VehicleFormValues = {
  type: VehicleTypeValue | ''
  color: ColorValue | ''
  plate: string
  brandModel: string
}

export type UnitFormValue = {
  value: string
}

export type ResidentFormValues = {
  fullName: string
  document: string
  phone: string
  email: string
  units: UnitFormValue[]
  relation: ResidentRelationValue | ''
  vehicles: VehicleFormValues[]
  observations: string
}

const DEFAULT_RESIDENT_FORM_VALUES: ResidentFormValues = {
  fullName: '',
  document: '',
  phone: '',
  email: '',
  units: [{ value: '' }],
  relation: '',
  vehicles: [{ type: '', color: '', plate: '', brandModel: '' }],
  observations: '',
}

export function mapResidentFormValuesToPayload(values: ResidentFormValues): CreateResidentRequest {
  return {
    fullName: values.fullName.trim(),
    document: values.document.trim(),
    phone: values.phone.trim() || undefined,
    email: values.email.trim() || undefined,
    units: values.units.map((unit) => unit.value.trim()).filter(Boolean),
    relation: values.relation as ResidentRelationValue,
    observations: values.observations.trim() || undefined,
    vehicles: values.vehicles.map((vehicle) => ({
      type: vehicle.type,
      color: vehicle.color || undefined,
      plate: vehicle.plate.trim() || undefined,
      brandModel: vehicle.brandModel.trim() || undefined,
    })),
  }
}

type ResidentFormProps = {
  defaultValues?: ResidentFormValues
  isSubmitting: boolean
  submitLabel: string
  onSubmit: (values: ResidentFormValues) => Promise<void> | void
  onCancel: () => void
}

export function ResidentForm({
  defaultValues,
  isSubmitting,
  submitLabel,
  onSubmit,
  onCancel,
}: ResidentFormProps) {
  const {
    control,
    register,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<ResidentFormValues>({
    defaultValues: defaultValues ?? DEFAULT_RESIDENT_FORM_VALUES,
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'vehicles',
  })

  const {
    fields: unitFields,
    append: appendUnit,
    remove: removeUnit,
  } = useFieldArray({
    control,
    name: 'units',
  })

  const handleAddUnit = () => {
    appendUnit({ value: '' })
  }

  const validateUniqueUnit = (value: string, index: number) => {
    const normalizedValue = value.trim().toLowerCase()
    const isDuplicate = getValues('units').some(
      (unit, unitIndex) => unitIndex < index && unit.value.trim().toLowerCase() === normalizedValue,
    )

    return isDuplicate ? 'Unidade já informada' : true
  }

  const handleAddVehicle = () => {
    append({ type: '', color: '', plate: '', brandModel: '' })
  }

  const handleRemoveVehicle = (index: number) => {
    remove(index)
  }

  return (
    <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)}>
      <MuiCard>
        <CardContent>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <PersonRoundedIcon color="primary" fontSize="small" />
              <Typography variant="h4">Dados Pessoais</Typography>
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldStack>
                  <TextFieldLabel required>Nome completo</TextFieldLabel>
                  <TextField
                    required
                    error={Boolean(errors.fullName)}
                    helperText={errors.fullName?.message}
                    {...register('fullName', {
                      required: 'Informe o nome completo',
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
                  <TextFieldLabel required>CPF/RG</TextFieldLabel>
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
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <HomeRoundedIcon color="primary" fontSize="small" />
                <Typography variant="h4">Residência e Vínculo</Typography>
              </Stack>
              <Button
                type="button"
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<AddRoundedIcon fontSize="small" />}
                onClick={handleAddUnit}
              >
                Adicionar unidade
              </Button>
            </Stack>

            <Grid container spacing={2}>
              {unitFields.map((unitField, index) => {
                const canRemoveUnit = unitFields.length > 1

                return (
                  <Grid key={unitField.id} size={{ xs: 12, sm: 6 }}>
                    <TextFieldStack>
                      <TextFieldLabel required={index === 0}>
                        {unitFields.length > 1 ? `Unidade ${index + 1}` : 'Unidade'}
                      </TextFieldLabel>
                      <TextField
                        required={index === 0}
                        error={Boolean(errors.units?.[index]?.value)}
                        helperText={errors.units?.[index]?.value?.message}
                        {...register(`units.${index}.value`, {
                          validate: (value) => {
                            if (!value.trim()) {
                              return 'Informe a unidade'
                            }

                            return validateUniqueUnit(value, index)
                          },
                        })}
                        slotProps={{
                          input: {
                            endAdornment: canRemoveUnit ? (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label={`Remover unidade ${index + 1}`}
                                  color="error"
                                  size="small"
                                  edge="end"
                                  onClick={() => removeUnit(index)}
                                >
                                  <DeleteOutlineRoundedIcon fontSize="small" />
                                </IconButton>
                              </InputAdornment>
                            ) : undefined,
                          },
                        }}
                      />
                    </TextFieldStack>
                  </Grid>
                )
              })}

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldStack>
                  <TextFieldLabel required>Vínculo</TextFieldLabel>
                  <Controller
                    control={control}
                    name="relation"
                    rules={{ required: 'Selecione o vínculo' }}
                    render={({ field }) => (
                      <TextField
                        select
                        required
                        error={Boolean(errors.relation)}
                        helperText={errors.relation?.message}
                        {...field}
                        value={field.value ?? ''}
                        SelectProps={{ displayEmpty: true }}
                      >
                        <MenuItem value="" disabled>
                          Selecione
                        </MenuItem>
                        {RESIDENT_RELATION_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
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
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <DirectionsCarRoundedIcon color="primary" fontSize="small" />
                <Typography variant="h4">Veículos</Typography>
              </Stack>
              <Button
                type="button"
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<AddRoundedIcon fontSize="small" />}
                onClick={handleAddVehicle}
              >
                Adicionar veículo
              </Button>
            </Stack>

            <Stack spacing={2}>
              {fields.map((vehicleField, index) => {
                const canRemoveVehicle = fields.length > 1 && index > 0

                return (
                  <Stack
                    key={vehicleField.id}
                    spacing={1.5}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'rgba(255, 255, 255, 0.06)',
                      borderRadius: 1,
                      bgcolor: 'rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography
                        variant="overline"
                        color="text.disabled"
                        sx={{ letterSpacing: 1 }}
                      >
                        Veículo {index + 1}
                      </Typography>
                      {canRemoveVehicle ? (
                        <IconButton
                          aria-label="Remover veículo"
                          color="error"
                          size="small"
                          onClick={() => handleRemoveVehicle(index)}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      ) : null}
                    </Stack>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <TextFieldStack>
                          <TextFieldLabel>Veículo</TextFieldLabel>
                          <Controller
                            control={control}
                            name={`vehicles.${index}.type`}
                            rules={{
                              validate: (value) => {
                                const vehicleData = getValues(`vehicles.${index}`)
                                const hasVehicleDetails = Boolean(
                                  vehicleData.color ||
                                  vehicleData.plate.trim() ||
                                  vehicleData.brandModel.trim(),
                                )

                                if (hasVehicleDetails && !value) {
                                  return 'Selecione o tipo do veiculo'
                                }

                                return true
                              },
                            }}
                            render={({ field }) => (
                              <TextField
                                select
                                error={Boolean(errors.vehicles?.[index]?.type)}
                                helperText={errors.vehicles?.[index]?.type?.message}
                                {...field}
                                value={field.value ?? ''}
                                SelectProps={{ displayEmpty: true }}
                              >
                                <MenuItem value="" disabled>
                                  Selecione
                                </MenuItem>
                                {VEHICLE_TYPE_OPTIONS.map((option) => (
                                  <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                  </MenuItem>
                                ))}
                              </TextField>
                            )}
                          />
                        </TextFieldStack>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <TextFieldStack>
                          <TextFieldLabel>Placa</TextFieldLabel>
                          <TextField {...register(`vehicles.${index}.plate`)} />
                        </TextFieldStack>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <TextFieldStack>
                          <TextFieldLabel>Marca - Modelo</TextFieldLabel>
                          <TextField {...register(`vehicles.${index}.brandModel`)} />
                        </TextFieldStack>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <TextFieldStack>
                          <TextFieldLabel>Cor</TextFieldLabel>
                          <Controller
                            control={control}
                            name={`vehicles.${index}.color`}
                            render={({ field }) => (
                              <ColorSelect {...field} value={field.value ?? ''} />
                            )}
                          />
                        </TextFieldStack>
                      </Grid>
                    </Grid>
                  </Stack>
                )
              })}
            </Stack>
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
