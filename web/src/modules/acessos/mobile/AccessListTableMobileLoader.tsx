'use client'

import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'

import { MobileListCard } from '@/styles/MobileList.styles'

type AccessListTableMobileLoaderProps = {
  showActions: boolean
}

export function AccessListTableMobileLoader({ showActions }: AccessListTableMobileLoaderProps) {
  return (
    <MobileListCard variant="outlined" sx={{ p: 5 }}>
      <Stack spacing={5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Skeleton variant="text" sx={{ fontSize: '1rem' }} width={140} />
          <Skeleton variant="rounded" width={72} height={22} />
        </Stack>

        <Divider sx={{ borderColor: 'divider' }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={90} />
          <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={90} />
          <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={70} />
          <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={70} />
        </Box>

        {showActions ? <Skeleton variant="rounded" width="100%" height={36} /> : null}
      </Stack>
    </MobileListCard>
  )
}
