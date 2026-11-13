'use client'

import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { AccessRecord } from '@/modules/acessos/hooks/useAccessList'
import { MobileListCard } from '@/styles/MobileList.styles'

type DashboardRecentAccessesMobileListProps = {
  records: AccessRecord[]
  onRegisterExit: (record: AccessRecord) => void
}

export function DashboardRecentAccessesMobileList({
  records,
  onRegisterExit,
}: DashboardRecentAccessesMobileListProps) {
  return (
    <Stack spacing={3}>
      {records.map((record) => (
        <MobileListCard key={record.id} variant="outlined">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Stack sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="body2" fontWeight={700} noWrap color="text.primary">
                {record.name}
              </Typography>
              {record.categoryUnits.map((categoryUnit) => (
                <Typography key={categoryUnit.id} variant="caption" color="text.secondary" noWrap>
                  {categoryUnit.label}
                </Typography>
              ))}
            </Stack>

            {record.hasExited ? (
              <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                Saída em {record.exitAt}
              </Typography>
            ) : (
              <Button
                variant="outlined"
                size="small"
                sx={{ flexShrink: 0 }}
                onClick={() => onRegisterExit(record)}
              >
                Registrar saída
              </Button>
            )}
          </Stack>
        </MobileListCard>
      ))}
    </Stack>
  )
}
