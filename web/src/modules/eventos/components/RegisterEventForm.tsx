'use client'

import { useRouter } from 'next/navigation'

import { EventForm, mapEventFormValuesToPayload, type EventFormValues } from '@/modules/eventos/components/EventForm'
import { useCreateEvent } from '@/modules/eventos/hooks/useCreateEvent'
import { useAppSnackbar } from '@/providers'

export function RegisterEventForm() {
  const router = useRouter()
  const createEventMutation = useCreateEvent()
  const { showError, showSuccess } = useAppSnackbar()

  const onSubmit = async (values: EventFormValues) => {
    try {
      await createEventMutation.mutateAsync(mapEventFormValuesToPayload(values))

      showSuccess('Evento registrado com sucesso.')
      router.push('/eventos')
      router.refresh()
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Não foi possível registrar o evento.')
    }
  }

  const handleCancel = () => router.push('/eventos')

  return (
    <EventForm
      submitLabel="Salvar Evento"
      isSubmitting={createEventMutation.isPending}
      onSubmit={onSubmit}
      onCancel={handleCancel}
    />
  )
}
