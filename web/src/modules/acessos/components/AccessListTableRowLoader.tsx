'use client'

import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'

import { TableCell } from '@/modules/table/components/TableCell'
import { TableRow } from '@/modules/table/components/TableRow'

type AccessListTableRowLoaderProps = {
  showActions: boolean
}

export function AccessListTableRowLoader({ showActions }: AccessListTableRowLoaderProps) {
  return (
    <TableRow>
      <TableCell>
        <Stack spacing={0.25}>
          <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={140} />
          <Skeleton variant="text" sx={{ fontSize: '0.75rem' }} width={100} />
        </Stack>
      </TableCell>
      <TableCell>
        <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={80} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={70} />
      </TableCell>
      <TableCell>
        <Stack spacing={0}>
          <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={90} />
          <Skeleton variant="text" sx={{ fontSize: '0.75rem' }} width={56} />
        </Stack>
      </TableCell>
      <TableCell>
        <Stack spacing={0}>
          <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={90} />
          <Skeleton variant="text" sx={{ fontSize: '0.75rem' }} width={56} />
        </Stack>
      </TableCell>
      <TableCell>
        <Skeleton variant="rounded" width={64} height={22} />
      </TableCell>
      {showActions ? (
        <TableCell>
          <Skeleton variant="rounded" width={112} height={32} />
        </TableCell>
      ) : null}
    </TableRow>
  )
}
