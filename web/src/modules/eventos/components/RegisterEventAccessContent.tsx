'use client'

import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

import type { EventVehicleMovementType, RegisterEventAccessRequest } from '@/app/api/events/types'
import { EventAccessGuestsCard } from '@/modules/eventos/components/EventAccessGuestsCard'
import {
  EventAccessVehicleCard,
  EMPTY_EVENT_ACCESS_VEHICLE_VALUES,
  type EventAccessVehicleValues,
} from '@/modules/eventos/components/EventAccessVehicleCard'
import { EventAccessTypeCard } from '@/modules/eventos/components/EventAccessTypeCard'
import { useEvent } from '@/modules/eventos/hooks/useEvent'
import { useRegisterEventAccess } from '@/modules/eventos/hooks/useRegisterEventAccess'
import { BackToPreviousPageButton } from '@/modules/navigation/components/BackToPreviousPageButton'
import { ListErrorState } from '@/modules/table/components/ListErrorState'
import { useAppSnackbar } from '@/providers'

type NewGuestFormValues = {
  newGuests: { name: string; document: string }[]
}

type RegisterEventAccessContentProps = {
  eventId: string
}

export function RegisterEventAccessContent({ eventId }: RegisterEventAccessContentProps) {
  const router = useRouter()
  const { showSuccess, showError } = useAppSnackbar()
  const { event, isLoading, isError, errorMessage, refetch } = useEvent(eventId)
  const registerAccessMutation = useRegisterEventAccess()

  const [movementType, setMovementType] = useState<EventVehicleMovementType>('CONVIDADO')
  const [vehicleValues, setVehicleValues] = useState<EventAccessVehicleValues>(
    EMPTY_EVENT_ACCESS_VEHICLE_VALUES,
  )
  const [isWalkIn, setIsWalkIn] = useState(false)
  const [driverNameError, setDriverNameError] = useState('')
  const [driverDocumentError, setDriverDocumentError] = useState('')
  const [plateError, setPlateError] = useState('')
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([])
  const [guestDocuments, setGuestDocuments] = useState<Record<string, string>>({})

  const { control, getValues } = useForm<NewGuestFormValues>({
    defaultValues: { newGuests: [] },
  })
  const { fields: newGuestFields, append, remove } = useFieldArray({ control, name: 'newGuests' })

  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (isError || !event) {
    return (
      <ListErrorState
        title="Não foi possível carregar o evento."
        message={errorMessage}
        onRetry={refetch}
      />
    )
  }

  const handleMovementTypeChange = (value: EventVehicleMovementType) => {
    setMovementType(value)
    setSelectedGuestIds([])
    setGuestDocuments({})
    setIsWalkIn(false)
    setDriverNameError('')
    setDriverDocumentError('')
    setPlateError('')
  }

  const handleWalkInChange = (value: boolean) => {
    setIsWalkIn(value)
    setVehicleValues(EMPTY_EVENT_ACCESS_VEHICLE_VALUES)
    setDriverNameError('')
    setDriverDocumentError('')
    setPlateError('')
  }

  const handleToggleGuest = (guestId: string) => {
    setSelectedGuestIds((current) =>
      current.includes(guestId) ? current.filter((id) => id !== guestId) : [...current, guestId],
    )
  }

  const handleGuestDocumentChange = (guestId: string, value: string) => {
    setGuestDocuments((current) => ({ ...current, [guestId]: value }))
  }

  const handleCancel = () => router.back()

  const handleSubmit = async () => {
    const requiresDriverFields = movementType !== 'CONVIDADO'
    const nextDriverNameError =
      !requiresDriverFields || isWalkIn || vehicleValues.driverName.trim()
        ? ''
        : 'Nome do motorista é obrigatório.'
    const nextDriverDocumentError =
      !requiresDriverFields || isWalkIn || vehicleValues.driverDocument.trim()
        ? ''
        : 'CPF do motorista é obrigatório.'
    const nextPlateError = isWalkIn || vehicleValues.plate.trim() ? '' : 'Placa é obrigatória.'

    setDriverNameError(nextDriverNameError)
    setDriverDocumentError(nextDriverDocumentError)
    setPlateError(nextPlateError)

    if (nextDriverNameError || nextDriverDocumentError || nextPlateError) {
      return
    }

    const newGuestValues = getValues('newGuests')

    if (selectedGuestIds.length === 0 && newGuestValues.length === 0) {
      showError('Selecione ao menos um convidado ou adicione um novo convidado.')
      return
    }

    const missingDocumentGuestId = selectedGuestIds.find((guestId) => {
      const guest = event.guests.find((item) => item.id === guestId)
      const requiresDocument = guest && !guest.document && movementType !== 'BUSCA'

      return requiresDocument && !guestDocuments[guestId]?.trim()
    })

    if (missingDocumentGuestId) {
      showError('Informe o CPF dos convidados sem documento cadastrado antes de continuar.')
      return
    }

    const hasVehicleData =
      !isWalkIn &&
      Boolean(
        vehicleValues.driverName.trim() ||
          vehicleValues.driverDocument.trim() ||
          vehicleValues.plate.trim() ||
          vehicleValues.brandModel.trim() ||
          vehicleValues.color.trim(),
      )

    const payload: RegisterEventAccessRequest = {
      movementType,
      vehicle: hasVehicleData
        ? {
            driverName: vehicleValues.driverName.trim() || undefined,
            driverDocument: vehicleValues.driverDocument.trim() || undefined,
            plate: vehicleValues.plate.trim() || undefined,
            brandModel: vehicleValues.brandModel.trim() || undefined,
            color: vehicleValues.color.trim() || undefined,
          }
        : undefined,
      guests: selectedGuestIds.map((guestId) => ({
        guestId,
        document: guestDocuments[guestId]?.trim() || undefined,
      })),
      newGuests:
        movementType === 'BUSCA' || newGuestValues.length === 0
          ? undefined
          : newGuestValues.map((guest) => ({
              name: guest.name,
              document: guest.document.trim() || undefined,
            })),
    }

    try {
      await registerAccessMutation.mutateAsync({ eventId, payload })
      showSuccess('Acesso registrado com sucesso.')
      router.push(`/eventos/${eventId}`)
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Não foi possível registrar o acesso.')
    }
  }

  return (
    <Stack spacing={{ xs: 5, sm: 6 }} py={{ xs: 3, sm: 5 }}>
      <Stack spacing={{ xs: 2.5, sm: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <BackToPreviousPageButton
            ariaLabel="Voltar para a pagina anterior"
            fallbackHref={`/eventos/${eventId}`}
          />

          <Typography variant="h2" fontWeight={700} color="text.primary">
            Registrar Acesso ao Evento
          </Typography>
        </Stack>

        <Typography variant="body2" color="primary.main">
          {event.title}
        </Typography>
      </Stack>

      <Stack spacing={2.5}>
        <EventAccessTypeCard value={movementType} onChange={handleMovementTypeChange} />

        <EventAccessVehicleCard
          movementType={movementType}
          value={vehicleValues}
          onChange={setVehicleValues}
          isWalkIn={isWalkIn}
          onWalkInChange={handleWalkInChange}
          driverNameError={driverNameError}
          driverDocumentError={driverDocumentError}
          plateError={plateError}
        />

        <EventAccessGuestsCard
          event={event}
          movementType={movementType}
          selectedGuestIds={selectedGuestIds}
          onToggleGuest={handleToggleGuest}
          guestDocuments={guestDocuments}
          onGuestDocumentChange={handleGuestDocumentChange}
          newGuestFields={newGuestFields}
          onAppendNewGuest={append}
          onRemoveNewGuest={remove}
        />
      </Stack>

      <Stack
        direction={{ xs: 'column-reverse', sm: 'row' }}
        justifyContent="flex-end"
        spacing={1.5}
        sx={{
          pt: 2,
          pb: { xs: 2, sm: 0 },
          borderTop: '1px solid',
          borderColor: 'divider',
          position: { xs: 'sticky', sm: 'static' },
          bottom: 0,
          bgcolor: 'background.default',
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={handleCancel}
          disabled={registerAccessMutation.isPending}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => void handleSubmit()}
          disabled={registerAccessMutation.isPending}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          {registerAccessMutation.isPending ? 'Registrando...' : 'Registrar Acesso'}
        </Button>
      </Stack>
    </Stack>
  )
}
