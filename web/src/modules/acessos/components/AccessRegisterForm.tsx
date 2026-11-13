'use client'

import AddRoundedIcon from '@mui/icons-material/AddRounded'
import CircularProgress from '@mui/material/CircularProgress'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import DirectionsCarFilledRoundedIcon from '@mui/icons-material/DirectionsCarFilledRounded'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'

import { useCreateAccessRecord } from '@/modules/acessos/hooks/useCreateAccessRecord'
import { type PersonSearchOption } from '@/modules/acessos/hooks/usePersonSearch'
import { PersonSearchAutocomplete } from '@/modules/acessos/components/PersonSearchAutocomplete'
import { useNavigateBack } from '@/modules/navigation/hooks/useNavigateBack'
import {
  type AccessPersonTypeValue,
  type ColorValue,
  ColorSelect,
  type LocomotionValue,
  LocomotionSelect,
  PersonTypeToggle,
  TextField,
  TextFieldLabel,
  TextFieldStack,
} from '@/modules/form'
import { useAppSnackbar } from '@/providers'

type PersonFormValues = {
  category: AccessPersonTypeValue | ''
  name: string
  document: string
  unit: string
}

type AccessRegisterFormValues = {
  people: PersonFormValues[]
  company: string
  locomotion: LocomotionValue | ''
  color: ColorValue | ''
  plate: string
  brandModel: string
  observations: string
}

export function AccessRegisterForm() {
  const navigateBack = useNavigateBack('/acessos')
  const createAccessRecordMutation = useCreateAccessRecord()
  const { showError, showSuccess } = useAppSnackbar()

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AccessRegisterFormValues>({
    defaultValues: {
      people: [{ category: '', name: '', document: '', unit: '' }],
      company: '',
      locomotion: '',
      color: '',
      plate: '',
      brandModel: '',
      observations: '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'people',
  })

  const watchedPeople = useWatch({ control, name: 'people' })
  const hasCompany = watchedPeople?.some(
    (person) => person.category === 'prestador_servico' || person.category === 'autorizado',
  )

  const handleAddPerson = () => {
    append({ category: '', name: '', document: '', unit: '' })
  }

  const handleRemovePerson = (index: number) => {
    remove(index)
  }

  const handlePersonSelect = (index: number, option: PersonSearchOption) => {
    setValue(`people.${index}.name`, option.name, { shouldDirty: true, shouldValidate: true })
    setValue(`people.${index}.document`, option.document, { shouldDirty: true })
    setValue(`people.${index}.unit`, option.unit, { shouldDirty: true })

    // A locomocao e compartilhada: so a Pessoa 1 define o veiculo do acesso.
    if (index === 0) {
      setValue('locomotion', option.locomotion, { shouldDirty: true, shouldValidate: true })
      setValue('color', option.color, { shouldDirty: true })
      setValue('plate', option.plate, { shouldDirty: true })
      setValue('brandModel', option.brandModel, { shouldDirty: true })

      if (option.companyName) {
        setValue('company', option.companyName, { shouldDirty: true })
      }
    }
  }

  const onSubmit = async (data: AccessRegisterFormValues) => {
    try {
      await createAccessRecordMutation.mutateAsync({
        people: data.people.map((person) => ({
          category: person.category,
          name: person.name.trim(),
          document: person.document.trim() || undefined,
          unit: person.unit.trim() || undefined,
        })),
        company: data.company.trim() || undefined,
        locomotion: data.locomotion || undefined,
        color: data.color || undefined,
        plate: data.plate.trim() || undefined,
        brandModel: data.brandModel.trim() || undefined,
        observations: data.observations.trim() || undefined,
      })

      showSuccess('Acesso registrado com sucesso.')
      navigateBack()
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Nao foi possivel registrar o acesso.')
    }
  }

  return (
    <Stack
      component="form"
      spacing={{ xs: 4, sm: 5 }}
      onSubmit={handleSubmit(onSubmit)}
      sx={{ width: '100%', maxWidth: 880 }}
    >
      {fields.map((personField, index) => {
        const canRemovePerson = fields.length > 1 && index > 0
        const isFirstPerson = index === 0
        const personCategory = watchedPeople?.[index]?.category
        const unitLabel =
          personCategory && personCategory !== 'morador' ? 'Unidade responsável' : 'Unidade'

        return (
          <Card key={personField.id} sx={{ p: { xs: 3, sm: 5 }, overflow: 'hidden' }}>
            <Stack spacing={{ xs: 4, sm: 3.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography
                  variant="overline"
                  color="text.disabled"
                  sx={{ letterSpacing: '0.08em' }}
                >
                  Pessoa {index + 1}
                </Typography>

                {canRemovePerson ? (
                  <Button
                    size="small"
                    color="inherit"
                    startIcon={<CloseRoundedIcon fontSize="small" />}
                    onClick={() => handleRemovePerson(index)}
                    sx={{ color: 'text.disabled' }}
                  >
                    Remover
                  </Button>
                ) : null}
              </Stack>

              <Controller
                control={control}
                name={`people.${index}.category`}
                rules={{ required: 'Selecione uma categoria' }}
                render={({ field }) => (
                  <PersonTypeToggle
                    value={field.value}
                    onChange={field.onChange}
                    error={Boolean(errors.people?.[index]?.category)}
                    helperText={errors.people?.[index]?.category?.message}
                  />
                )}
              />

              <TextFieldStack>
                <TextFieldLabel>Buscar cadastro</TextFieldLabel>
                <PersonSearchAutocomplete
                  category={personCategory || ''}
                  onSelect={(option) => handlePersonSelect(index, option)}
                />
              </TextFieldStack>

              <Grid container spacing={{ xs: 2.5, sm: 3.5 }}>
                <Grid size={{ xs: 12, sm: 6, md: 5 }}>
                  <TextFieldStack>
                    <TextFieldLabel required>Nome</TextFieldLabel>
                    <TextField
                      required
                      error={Boolean(errors.people?.[index]?.name)}
                      helperText={errors.people?.[index]?.name?.message}
                      {...register(`people.${index}.name`, {
                        required: 'Informe o nome',
                      })}
                    />
                  </TextFieldStack>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextFieldStack>
                    <TextFieldLabel>Documento (CPF/RG)</TextFieldLabel>
                    <TextField {...register(`people.${index}.document`)} />
                  </TextFieldStack>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <TextFieldStack>
                    <TextFieldLabel>{unitLabel}</TextFieldLabel>
                    <TextField {...register(`people.${index}.unit`)} />
                  </TextFieldStack>
                </Grid>
              </Grid>

              {isFirstPerson && hasCompany ? (
                <TextFieldStack>
                  <TextFieldLabel>Empresa</TextFieldLabel>
                  <TextField {...register('company')} />
                </TextFieldStack>
              ) : null}

              {isFirstPerson ? (
                <>
                  <Grid container spacing={{ xs: 2.5, sm: 3.5 }}>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                      <TextFieldStack>
                        <TextFieldLabel required>Locomoção</TextFieldLabel>
                        <Controller
                          control={control}
                          name="locomotion"
                          rules={{ required: 'Selecione uma locomoção' }}
                          render={({ field }) => (
                            <LocomotionSelect
                              required
                              error={Boolean(errors.locomotion)}
                              helperText={errors.locomotion?.message}
                              {...field}
                              value={field.value ?? ''}
                            />
                          )}
                        />
                      </TextFieldStack>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                      <TextFieldStack>
                        <TextFieldLabel>Cor</TextFieldLabel>
                        <Controller
                          control={control}
                          name="color"
                          render={({ field }) => (
                            <ColorSelect {...field} value={field.value ?? ''} />
                          )}
                        />
                      </TextFieldStack>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                      <TextFieldStack>
                        <TextFieldLabel>Placa</TextFieldLabel>
                        <TextField {...register('plate')} />
                      </TextFieldStack>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                      <TextFieldStack>
                        <TextFieldLabel>Marca - Modelo</TextFieldLabel>
                        <TextField {...register('brandModel')} />
                      </TextFieldStack>
                    </Grid>
                  </Grid>

                  <TextFieldStack>
                    <TextFieldLabel>Observações</TextFieldLabel>
                    <TextField multiline minRows={3} {...register('observations')} />
                  </TextFieldStack>
                </>
              ) : (
                <Stack direction="row" spacing={1} alignItems="center">
                  <DirectionsCarFilledRoundedIcon
                    fontSize="small"
                    sx={{ color: 'text.disabled' }}
                  />
                  <Typography variant="body2" color="text.disabled">
                    Entra no mesmo veículo da Pessoa 1
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Card>
        )
      })}

      <Button
        variant="outlined"
        color="inherit"
        fullWidth
        startIcon={<AddRoundedIcon fontSize="small" />}
        onClick={handleAddPerson}
        sx={{ color: 'text.primary', borderColor: 'rgba(255, 255, 255, 0.1)' }}
      >
        Adicionar pessoa (mesmo veículo)
      </Button>

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
          onClick={navigateBack}
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
          disabled={isSubmitting || createAccessRecordMutation.isPending}
          variant="contained"
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          {isSubmitting || createAccessRecordMutation.isPending ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} color="inherit" />
              <span>Salvando...</span>
            </Stack>
          ) : (
            'Registrar Acesso'
          )}
        </Button>
      </Stack>
    </Stack>
  )
}
