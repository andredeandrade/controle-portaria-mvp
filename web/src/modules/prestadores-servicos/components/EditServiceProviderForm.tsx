'use client'

import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/navigation'

import {
  mapServiceProviderFormValuesToPayload,
  ServiceProviderForm,
  type ServiceProviderFormValues,
} from '@/modules/prestadores-servicos/components/ServiceProviderForm'
import { useServiceProvider } from '@/modules/prestadores-servicos/hooks/useServiceProvider'
import { useUpdateServiceProvider } from '@/modules/prestadores-servicos/hooks/useUpdateServiceProvider'
import { ListErrorState } from '@/modules/table/components/ListErrorState'
import { useAppSnackbar } from '@/providers'

type EditServiceProviderFormProps = {
  serviceProviderId: string
}

export function EditServiceProviderForm({ serviceProviderId }: EditServiceProviderFormProps) {
  const router = useRouter()
  const { serviceProvider, isLoading, isError, errorMessage, refetch } =
    useServiceProvider(serviceProviderId)
  const updateServiceProviderMutation = useUpdateServiceProvider(serviceProviderId)
  const { showError, showSuccess } = useAppSnackbar()

  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (isError || !serviceProvider) {
    return (
      <ListErrorState
        title="Não foi possível carregar o prestador de serviço."
        message={errorMessage}
        onRetry={refetch}
      />
    )
  }

  const defaultValues: ServiceProviderFormValues = {
    responsibleName: serviceProvider.responsibleName,
    document: serviceProvider.document ?? '',
    companyName: serviceProvider.companyName,
    serviceType: serviceProvider.serviceType,
    phone: serviceProvider.phone ?? '',
    email: serviceProvider.email ?? '',
    unit: serviceProvider.unit ?? '',
    authorizedBy: serviceProvider.authorizedBy,
    vehiclePlate: serviceProvider.vehiclePlate ?? '',
    vehicleBrandModel: serviceProvider.vehicleBrandModel ?? '',
    vehicleColor: serviceProvider.vehicleColor ?? '',
    observations: serviceProvider.observations ?? '',
  }

  const onSubmit = async (values: ServiceProviderFormValues) => {
    try {
      await updateServiceProviderMutation.mutateAsync(
        mapServiceProviderFormValuesToPayload(values),
      )

      showSuccess('Prestador de serviço atualizado com sucesso.')
      router.push('/prestadores-servicos')
      router.refresh()
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar o prestador de serviço.',
      )
    }
  }

  return (
    <ServiceProviderForm
      defaultValues={defaultValues}
      submitLabel="Salvar alterações"
      isSubmitting={updateServiceProviderMutation.isPending}
      onSubmit={onSubmit}
      onCancel={() => router.push('/prestadores-servicos')}
    />
  )
}
