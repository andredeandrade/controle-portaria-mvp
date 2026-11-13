'use client'

import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'

import { MobileListCard } from '@/styles/MobileList.styles'

export function AuthorizationsMobileListLoader() {
  return (
    <MobileListCard variant="outlined" sx={{ p: 5, position: 'relative' }}>
      <Stack spacing={5}>
        <Stack spacing={0.25} sx={{ pr: 5 }}>
          <Skeleton variant="text" sx={{ fontSize: '1rem' }} width={160} />
          <Skeleton variant="text" sx={{ fontSize: '0.75rem' }} width={110} />
        </Stack>

        <Skeleton
          variant="circular"
          width={28}
          height={28}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        />

        <Divider sx={{ borderColor: 'divider' }} />

        <Grid container spacing={2}>
          <Grid size={6}>
            <Skeleton variant="text" sx={{ fontSize: '0.75rem' }} width={60} />
            <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={100} />
          </Grid>
          <Grid size={6}>
            <Skeleton variant="text" sx={{ fontSize: '0.75rem' }} width={60} />
            <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={100} />
          </Grid>
          <Grid size={12}>
            <Skeleton variant="text" sx={{ fontSize: '0.75rem' }} width={60} />
            <Skeleton variant="text" sx={{ fontSize: '0.875rem' }} width={70} />
          </Grid>
        </Grid>
      </Stack>
    </MobileListCard>
  )
}
