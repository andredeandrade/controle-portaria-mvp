'use client'

import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/navigation'

import { useCan } from '@/hooks/useCan'
import { useEventListContext } from '@/modules/eventos/context/EventListContext'
import { TableCell } from '@/modules/table/components/TableCell'
import { TableRow } from '@/modules/table/components/TableRow'
import type { EventRecord } from '@/types/eventos'

type EventsTableRowProps = {
  record: EventRecord
}

export function EventsTableRow({ record }: EventsTableRowProps) {
  const router = useRouter()
  const { handleOpenDeleteConfirmation } = useEventListContext()
  const canUpdate = useCan('events', 'update')
  const canRemove = useCan('events', 'remove')

  return (
    <TableRow>
      <TableCell>
        <Stack spacing={0.25}>
          <Typography variant="body2" fontWeight={700} color="text.primary">
            {record.title}
          </Typography>
          {record.space ? (
            <Typography variant="caption" color="text.disabled">
              {record.space}
            </Typography>
          ) : null}
        </Stack>
      </TableCell>
      <TableCell>
        <Stack spacing={0.25}>
          <Typography variant="body2" fontWeight={700} color="text.primary">
            {record.date}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {record.time}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.primary">
          {record.unit}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.primary">
          {record.responsibleName}
        </Typography>
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={2} alignItems="center">
          <GroupsRoundedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
          <Typography variant="body2" color="text.primary">
            {record.guestsCount}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <IconButton
            size="small"
            aria-label="Visualizar evento"
            onClick={() => router.push(`/eventos/${record.id}`)}
          >
            <VisibilityRoundedIcon fontSize="small" />
          </IconButton>
          {canUpdate ? (
            <IconButton
              size="small"
              aria-label="Editar evento"
              onClick={() => router.push(`/eventos/${record.id}/editar`)}
            >
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          ) : null}
          {canRemove ? (
            <IconButton
              size="small"
              aria-label="Excluir evento"
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
