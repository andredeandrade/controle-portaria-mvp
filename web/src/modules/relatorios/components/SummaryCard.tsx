'use client'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import type { SvgIconComponent } from '@mui/icons-material'

interface SummaryCardProps {
  label: string
  value: number | undefined
  isLoading: boolean
  icon: SvgIconComponent
  color?: string
  /** Quando true, exibe badge "Total geral" indicando que não há filtro de data */
  isTotal?: boolean
}

export function SummaryCard({
  label,
  value,
  isLoading,
  icon: Icon,
  color = 'primary.main',
  isTotal = false,
}: SummaryCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}
            >
              {label}
            </Typography>

            {isLoading ? (
              <Skeleton variant="text" width={64} height={40} sx={{ mt: 0.5 }} />
            ) : (
              <Typography variant="h2" sx={{ mt: 0.5 }}>
                {value ?? '—'}
              </Typography>
            )}

            {isTotal && (
              <Tooltip title="Contagem total de registros, sem filtro de período">
                <Chip
                  label="Total geral"
                  size="small"
                  variant="outlined"
                  sx={{ mt: 1, fontSize: '0.7rem' }}
                />
              </Tooltip>
            )}
          </Box>

          <Box
            sx={{
              p: 1.5,
              borderRadius: '12px',
              bgcolor: `${color}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ color, fontSize: 24 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
