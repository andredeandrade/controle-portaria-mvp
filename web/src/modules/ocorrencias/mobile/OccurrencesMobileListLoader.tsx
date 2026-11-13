'use client'

import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'

import { MobileListCard } from '@/styles/MobileList.styles'

export function OccurrencesMobileListLoader() {
  return (
    <MobileListCard variant="outlined" sx={{ p: 5 }}>
      <Stack spacing={5}>
        <Box>
          <Skeleton variant="text" sx={{ fontSize: '1rem' }} width={160} />
          <Skeleton variant="text" sx={{ fontSize: '0.75rem' }} width={100} />
        </Box>

        <Stack direction="row" spacing={2}>
          <Box>
            <Skeleton variant="text" sx={{ fontSize: '0.75rem' }} width={40} />
            <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={70} />
          </Box>
          <Box>
            <Skeleton variant="text" sx={{ fontSize: '0.75rem' }} width={40} />
            <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={50} />
          </Box>
        </Stack>

        <Box>
          <Skeleton variant="text" sx={{ fontSize: '0.75rem' }} width={100} />
          <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={120} />
        </Box>

        <Divider sx={{ borderColor: 'divider' }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Skeleton variant="rounded" width={96} height={32} />
          <Skeleton variant="circular" width={28} height={28} />
        </Stack>
      </Stack>
    </MobileListCard>
  )
}
