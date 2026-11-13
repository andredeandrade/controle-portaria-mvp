'use client'

import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'

import { TableCell } from '@/modules/table/components/TableCell'
import { TableRow } from '@/modules/table/components/TableRow'

export function ResidentsTableRowLoader() {
  return (
    <TableRow>
      <TableCell>
        <Stack spacing={0.25}>
          <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={140} />
          <Skeleton variant="text" sx={{ fontSize: '0.75rem' }} width={100} />
        </Stack>
      </TableCell>
      <TableCell>
        <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={70} />
      </TableCell>
      <TableCell>
        <Skeleton variant="rounded" width={90} height={22} />
      </TableCell>
      <TableCell>
        <Skeleton variant="rounded" width={70} height={22} />
      </TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Skeleton variant="circular" width={28} height={28} />
          <Skeleton variant="circular" width={28} height={28} />
          <Skeleton variant="circular" width={28} height={28} />
        </Stack>
      </TableCell>
    </TableRow>
  )
}
