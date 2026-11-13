'use client'

import { useRouter } from 'next/navigation'

import {
  mapServiceProviderFormValuesToPayload,
  ServiceProviderForm,
  type ServiceProviderFormValues,
} from '@/modules/prestadores-servicos/components/ServiceProviderForm'
import { useCreateServiceProvider } from '@/modules/prestadores-servicos/hooks/useCreateServiceProvider'
import { useAppSnackbar } from '@/providers'

export function RegisterServiceProviderForm() {
  const router = useRouter()
  const createServiceProviderMutation = useCreateServiceProvider()
  const { showError, showSuccess } = useAppSnackbar()

  const onSubmit = async (values: ServiceProviderFormValues) => {
    try {
      await createServiceProviderMutation.mutateAsync(
        mapServiceProviderFormValuesToPayload(values),
      )

      showSuccess('Prestador de serviço registrado com sucesso.')
      router.push('/prestadores-servicos')
      router.refresh()
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : 'Não foi possível registrar o prestador de serviço.',
      )
    }
  }

  const handleCancel = () => router.push('/prestadores-servicos')

  return (
    <ServiceProviderForm
      submitLabel="Salvar Prestador"
      isSubmitting={createServiceProviderMutation.isPending}
      onSubmit={onSubmit}
      onCancel={handleCancel}
    />
  )
}
