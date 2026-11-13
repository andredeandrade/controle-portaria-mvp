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
import { useResidentListContext } from '@/modules/moradores/context/ResidentListContext'
import {
  DEFAULT_RESIDENT_CATEGORY_CHIP_COLOR,
  residentCategoryChipColor,
} from '@/modules/moradores/styles/ResidentStyles'
import { TableCell } from '@/modules/table/components/TableCell'
import { TableRow } from '@/modules/table/components/TableRow'
import type { ResidentRecord } from '@/types/moradores'

type ResidentsTableRowProps = {
  record: ResidentRecord
}

export function ResidentsTableRow({ record }: ResidentsTableRowProps) {
  const router = useRouter()
  const { handleOpenDeleteConfirmation, handleOpenView } = useResidentListContext()
  const canUpdate = useCan('residents', 'update')
  const canRemove = useCan('residents', 'remove')
  const chipColor =
    residentCategoryChipColor[record.relation.toLowerCase()] ?? DEFAULT_RESIDENT_CATEGORY_CHIP_COLOR

  return (
    <TableRow>
      <TableCell>
        <Stack spacing={0.25}>
          <Typography variant="body2" fontWeight={700} color="text.primary">
            {record.name}
          </Typography>
          {record.document ? (
            <Typography variant="caption" color="text.disabled">
              CPF: {record.document}
            </Typography>
          ) : null}
        </Stack>
      </TableCell>
      <TableCell>{record.units.join(', ') || '-'}</TableCell>
      <TableCell>
        <Chip
          label={record.relation}
          size="small"
          sx={{
            height: 22,
            fontSize: '0.6875rem',
            fontWeight: 600,
            backgroundColor: chipColor.bg,
            color: chipColor.color,
            border: 'none',
          }}
        />
      </TableCell>
      <TableCell>
        {record.vehicles.length > 0 ? (
          <Stack direction="row" spacing={0.75} flexWrap="wrap">
            {record.vehicles.map((vehicle, index) => (
              <Chip
                key={`${record.id}-${vehicle.plate}-${index}`}
                label={vehicle.plate}
                size="small"
                variant="outlined"
                sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 600 }}
              />
            ))}
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
            aria-label="Visualizar morador"
            onClick={() => handleOpenView(record)}
          >
            <VisibilityRoundedIcon fontSize="small" />
          </IconButton>
          {canUpdate ? (
            <IconButton
              size="small"
              aria-label="Editar morador"
              onClick={() => router.push(`/moradores/${record.id}/editar`)}
            >
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          ) : null}
          {canRemove ? (
            <IconButton
              size="small"
              aria-label="Excluir morador"
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
