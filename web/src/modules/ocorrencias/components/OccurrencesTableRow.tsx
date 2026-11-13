'use client'

import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/navigation'

import { useCan } from '@/hooks/useCan'
import { useOccurrenceListContext } from '@/modules/ocorrencias/context/OccurrenceListContext'
import { TableCell } from '@/modules/table/components/TableCell'
import { TableRow } from '@/modules/table/components/TableRow'
import type { OccurrenceRecord } from '@/types/ocorrencias'

type OccurrencesTableRowProps = {
  record: OccurrenceRecord
}

export function OccurrencesTableRow({ record }: OccurrencesTableRowProps) {
  const router = useRouter()
  const { handleOpenDeleteConfirmation, handleOpenView } = useOccurrenceListContext()
  const canUpdate = useCan('incidents', 'update')
  const canRemove = useCan('incidents', 'remove')

  const handleEdit = () => {
    router.push(`/ocorrencias/${record.id}/editar`)
  }

  return (
    <TableRow>
      <TableCell>
        <Typography variant="body2" fontWeight={700} color="text.primary">
          {record.occurrenceTypeLabel}
        </Typography>
      </TableCell>
      <TableCell>{record.date}</TableCell>
      <TableCell>{record.time}</TableCell>
      <TableCell>{record.place}</TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <IconButton
            size="small"
            aria-label="Visualizar ocorrência"
            onClick={() => handleOpenView(record)}
          >
            <VisibilityRoundedIcon fontSize="small" />
          </IconButton>
          {canUpdate ? (
            <IconButton size="small" aria-label="Editar ocorrência" onClick={handleEdit}>
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          ) : null}
          {canRemove ? (
            <IconButton
              size="small"
              aria-label="Excluir ocorrência"
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
