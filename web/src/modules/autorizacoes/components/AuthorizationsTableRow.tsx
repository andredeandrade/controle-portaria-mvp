'use client'

import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/navigation'

import { useCan } from '@/hooks/useCan'
import { useAuthorizationListContext } from '@/modules/autorizacoes/context/AuthorizationListContext'
import { TableCell } from '@/modules/table/components/TableCell'
import { TableRow } from '@/modules/table/components/TableRow'
import type { AuthorizationRecord } from '@/types/autorizacoes'

type AuthorizationsTableRowProps = {
  record: AuthorizationRecord
}

export function AuthorizationsTableRow({ record }: AuthorizationsTableRowProps) {
  const router = useRouter()
  const { handleOpenDeleteConfirmation, handleOpenView } = useAuthorizationListContext()
  const canUpdate = useCan('authorizations', 'update')
  const canRemove = useCan('authorizations', 'remove')

  return (
    <TableRow>
      <TableCell>
        <Stack spacing={0.25}>
          <Typography variant="body2" fontWeight={700} color="text.primary">
            {record.authorizedName}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {record.personTypeLabel}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.primary" fontFamily="monospace">
          {record.document}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.primary" fontFamily="monospace">
          {record.validFromDate} {record.validFromTime}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" color="text.primary" fontFamily="monospace">
          {record.validToDate} {record.validToTime}
        </Typography>
      </TableCell>
      <TableCell>{record.unit}</TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <IconButton
            size="small"
            aria-label="Visualizar autorização"
            onClick={() => handleOpenView(record)}
          >
            <VisibilityRoundedIcon fontSize="small" />
          </IconButton>
          {canUpdate ? (
            <IconButton
              size="small"
              aria-label="Editar autorização"
              onClick={() => router.push(`/autorizacoes/${record.id}/editar`)}
            >
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          ) : null}
          {canRemove ? (
            <IconButton
              size="small"
              aria-label="Excluir autorização"
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
