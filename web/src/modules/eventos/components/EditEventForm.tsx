'use client'

import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/navigation'

import { EventForm, mapEventFormValuesToPayload, type EventFormValues } from '@/modules/eventos/components/EventForm'
import { useEvent } from '@/modules/eventos/hooks/useEvent'
import { useUpdateEvent } from '@/modules/eventos/hooks/useUpdateEvent'
import { ListErrorState } from '@/modules/table/components/ListErrorState'
import { useAppSnackbar } from '@/providers'

type EditEventFormProps = {
  eventId: string
}

export function EditEventForm({ eventId }: EditEventFormProps) {
  const router = useRouter()
  const { event, isLoading, isError, errorMessage, refetch } = useEvent(eventId)
  const updateEventMutation = useUpdateEvent(eventId)
  const { showError, showSuccess } = useAppSnackbar()

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

  const defaultValues: EventFormValues = {
    title: event.title,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime ?? '',
    unit: event.unit,
    space: event.space ?? '',
    responsibleName: event.responsibleName,
    guests: event.guests.length
      ? event.guests.map((guest) => ({
          id: guest.id,
          name: guest.name,
          document: guest.document ?? '',
        }))
      : [{ name: '', document: '' }],
    observations: event.observations ?? '',
  }

  const onSubmit = async (values: EventFormValues) => {
    try {
      await updateEventMutation.mutateAsync(mapEventFormValuesToPayload(values))

      showSuccess('Evento atualizado com sucesso.')
      router.push('/eventos')
      router.refresh()
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Não foi possível atualizar o evento.')
    }
  }

  return (
    <EventForm
      defaultValues={defaultValues}
      submitLabel="Salvar alterações"
      isSubmitting={updateEventMutation.isPending}
      onSubmit={onSubmit}
      onCancel={() => router.push('/eventos')}
    />
  )
}
