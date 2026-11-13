import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Metadata } from 'next'

import { AccessRegisterButton } from '@/modules/acessos/components/AccessRegisterButton'
import { DashboardRecentAccesses } from '@/modules/dashboard/components/DashboardRecentAccesses'
import { DashboardSummaryCards } from '@/modules/dashboard/components/DashboardSummaryCards'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default function DashboardPage() {
  return (
    <Stack spacing={{ xs: 7, sm: 5 }} py={{ xs: 3, sm: 5 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        flexWrap="wrap"
        spacing={3}
      >
        <Stack spacing={2}>
          <Typography variant="h2">Dashboard</Typography>
          <Typography variant="body1" color="text.secondary">
            Visão geral de acessos do condomínio.
          </Typography>
        </Stack>

        <AccessRegisterButton size="large" sx={{ width: { xs: '100%', sm: 'auto' } }} />
      </Stack>

      <DashboardSummaryCards />

      <DashboardRecentAccesses />
    </Stack>
  )
}
