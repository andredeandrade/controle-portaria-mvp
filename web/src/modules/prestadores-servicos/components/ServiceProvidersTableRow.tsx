'use client'

import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/navigation'

import { useCan } from '@/hooks/useCan'
import { useServiceProviderListContext } from '@/modules/prestadores-servicos/context/ServiceProviderListContext'
import { TableCell } from '@/modules/table/components/TableCell'
import { TableRow } from '@/modules/table/components/TableRow'
import type { ServiceProviderRecord } from '@/types/prestadores-servicos'

type ServiceProvidersTableRowProps = {
  record: ServiceProviderRecord
}

export function ServiceProvidersTableRow({ record }: ServiceProvidersTableRowProps) {
  const router = useRouter()
  const { handleOpenDeleteConfirmation, handleOpenView } = useServiceProviderListContext()
  const canUpdate = useCan('service-providers', 'update')
  const canRemove = useCan('service-providers', 'remove')
  const hasVehicle = Boolean(
    record.vehiclePlate || record.vehicleBrandModel || record.vehicleColor,
  )
  const vehicleDescription = [record.vehicleBrandModel, record.vehicleColor]
    .filter(Boolean)
    .join(' ')

  return (
    <TableRow>
      <TableCell>
        <Stack spacing={0.25}>
          <Typography variant="body2" fontWeight={700} color="text.primary">
            {record.responsibleName}
          </Typography>
          {record.document ? (
            <Typography variant="caption" color="text.disabled">
              {record.document}
            </Typography>
          ) : null}
        </Stack>
      </TableCell>
      <TableCell>
        <Stack spacing={0.25}>
          <Typography variant="body2" color="text.primary">
            {record.companyName}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {record.serviceType}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.primary">
          {record.unit || '—'}
        </Typography>
      </TableCell>
      <TableCell>
        {hasVehicle ? (
          <Stack spacing={0.25}>
            {record.vehiclePlate ? (
              <Chip
                label={record.vehiclePlate}
                size="small"
                variant="outlined"
                sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 600, alignSelf: 'flex-start' }}
              />
            ) : null}
            {vehicleDescription ? (
              <Typography variant="caption" color="text.disabled">
                {vehicleDescription}
              </Typography>
            ) : null}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.disabled">
            —
          </Typography>
        )}
      </TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <IconButton
            size="small"
            aria-label="Visualizar prestador de serviço"
            onClick={() => handleOpenView(record)}
          >
            <VisibilityRoundedIcon fontSize="small" />
          </IconButton>
          {canUpdate ? (
            <IconButton
              size="small"
              aria-label="Editar prestador de serviço"
              onClick={() => router.push(`/prestadores-servicos/${record.id}/editar`)}
            >
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          ) : null}
          {canRemove ? (
            <IconButton
              size="small"
              aria-label="Excluir prestador de serviço"
              onClick={() => handleOpenDeleteConfirmation(record)}
            >
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          ) : null}
        </Stack>
      </TableCell>
    </TableRow>
  )
}
