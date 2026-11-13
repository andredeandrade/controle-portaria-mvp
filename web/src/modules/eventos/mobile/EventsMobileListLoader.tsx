'use client'

import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'

import { MobileListCard } from '@/styles/MobileList.styles'

export function EventsMobileListLoader() {
  return (
    <MobileListCard variant="outlined" sx={{ p: 5 }}>
      <Stack spacing={5}>
        <Box>
          <Skeleton variant="text" sx={{ fontSize: '1rem' }} width={160} />
          <Skeleton variant="text" sx={{ fontSize: '0.75rem' }} width={100} />
        </Box>

        <Box>
          <Skeleton variant="text" sx={{ fontSize: '0.75rem' }} width={40} />
          <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={90} />
        </Box>

        <Box>
          <Skeleton variant="text" sx={{ fontSize: '0.75rem' }} width={60} />
          <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={70} />
        </Box>

        <Box>
          <Skeleton variant="text" sx={{ fontSize: '0.75rem' }} width={60} />
          <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={60} />
        </Box>

        <Box>
          <Skeleton variant="text" sx={{ fontSize: '0.75rem' }} width={90} />
          <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={120} />
        </Box>

        <Box>
          <Skeleton variant="text" sx={{ fontSize: '0.75rem' }} width={80} />
          <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={40} />
        </Box>

        <Divider sx={{ borderColor: 'divider' }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rounded" width={110} height={32} />
            <Skeleton variant="rounded" width={90} height={32} />
          </Stack>
          <Skeleton variant="circular" width={28} height={28} />
        </Stack>
      </Stack>
    </MobileListCard>
  )
}
