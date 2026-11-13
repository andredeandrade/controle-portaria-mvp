'use client'

import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'

import { MobileListCard } from '@/styles/MobileList.styles'

export function VisitorsMobileListLoader() {
  return (
    <MobileListCard variant="outlined" sx={{ p: 5 }}>
      <Stack spacing={5}>
        <Box>
          <Skeleton variant="text" sx={{ fontSize: '1rem' }} width={140} />
          <Skeleton variant="text" sx={{ fontSize: '0.75rem' }} width={100} />
        </Box>

        <Box>
          <Skeleton variant="text" sx={{ fontSize: '0.75rem' }} width={100} />
          <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={140} />
        </Box>

        <Box>
          <Skeleton variant="text" sx={{ fontSize: '0.75rem' }} width={60} />
          <Skeleton variant="rounded" width={80} height={22} sx={{ mt: 0.5 }} />
        </Box>

        <Divider sx={{ borderColor: 'divider' }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Skeleton variant="rounded" width={160} height={32} />
          <Skeleton variant="circular" width={28} height={28} />
        </Stack>
      </Stack>
    </MobileListCard>
  )
}
