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
import { useVisitorListContext } from '@/modules/visitantes/context/VisitorListContext'
import { TableCell } from '@/modules/table/components/TableCell'
import { TableRow } from '@/modules/table/components/TableRow'
import type { VisitorRecord } from '@/types/visitantes'

type VisitorsTableRowProps = {
  record: VisitorRecord
}

export function VisitorsTableRow({ record }: VisitorsTableRowProps) {
  const router = useRouter()
  const { handleOpenDeleteConfirmation, handleOpenView } = useVisitorListContext()
  const canUpdate = useCan('visitors', 'update')
  const canRemove = useCan('visitors', 'remove')
  const hasVehicle = Boolean(record.vehiclePlate || record.vehicleBrandModel || record.vehicleColor)
  const vehicleDescription = [record.vehicleBrandModel, record.vehicleColor]
    .filter(Boolean)
    .join(' ')

  return (
    <TableRow>
      <TableCell>
        <Stack spacing={0.25}>
          <Typography variant="body2" fontWeight={700} color="text.primary">
            {record.name}
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
            {record.authorizedBy}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {record.unit}
          </Typography>
        </Stack>
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
      <TableCell>{record.phone}</TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <IconButton
            size="small"
            aria-label="Visualizar visitante"
            onClick={() => handleOpenView(record)}
          >
            <VisibilityRoundedIcon fontSize="small" />
          </IconButton>
          {canUpdate ? (
            <IconButton
              size="small"
              aria-label="Editar visitante"
              onClick={() => router.push(`/visitantes/${record.id}/editar`)}
            >
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          ) : null}
          {canRemove ? (
            <IconButton
              size="small"
              aria-label="Excluir visitante"
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
