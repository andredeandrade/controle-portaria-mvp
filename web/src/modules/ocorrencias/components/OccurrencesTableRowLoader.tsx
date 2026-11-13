'use client'

import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'

import { TableCell } from '@/modules/table/components/TableCell'
import { TableRow } from '@/modules/table/components/TableRow'

export function OccurrencesTableRowLoader() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={160} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={80} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={60} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={120} />
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
