'use client'

import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import { alpha } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { exportReport } from '@/services/relatorios/export'
import type { ReportModuleDef } from '@/services/relatorios/reportDefs'
import { useAppSnackbar } from '@/providers/AppSnackbarProvider'
import type { ReportsPeriodFilter } from '@/types/relatorios'

/**
 * Resolve um caminho de cor do tema (ex: "success.main") para o valor de cor
 * correspondente, permitindo aplicar `alpha()` sobre cores do palette do MUI.
 */
function resolveThemeColor(theme: Theme, path: string): string {
  return path
    .split('.')
    .reduce<unknown>(
      (value, key) => (value as Record<string, unknown>)?.[key],
      theme.palette,
    ) as string
}

type ReportModuleCardProps = {
  def: ReportModuleDef
  total: number | undefined
  isLoading: boolean
  filter: ReportsPeriodFilter
}

export function ReportModuleCard({ def, total, isLoading, filter }: ReportModuleCardProps) {
  const router = useRouter()
  const { showSuccess, showError } = useAppSnackbar()
  const [loading, setLoading] = useState(false)

  const Icon = def.icon

  async function handleExport() {
    setLoading(true)

    try {
      await exportReport(def.key, filter)
      showSuccess(`Relatório de ${def.cardLabel.toLowerCase()} exportado com sucesso.`)
    } catch {
      showError(`Não foi possível exportar o relatório de ${def.cardLabel.toLowerCase()}.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 4, height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, minWidth: 0 }}>
          <Box
            sx={(theme) => ({
              flex: 'none',
              width: 38,
              height: 38,
              borderRadius: '10px',
              bgcolor: alpha(resolveThemeColor(theme, def.color), 0.16),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <Icon sx={{ color: def.color, fontSize: 20 }} />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body1" fontWeight={600} noWrap>
              {def.cardLabel}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap component="div">
              {def.cardDescricao}
            </Typography>
          </Box>
        </Box>

        {isLoading ? (
          <Skeleton variant="text" width={64} height={40} />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 3, pl: 2.5 }}>
            <Typography variant="h2">{total ?? '—'}</Typography>
            <Typography variant="caption" color="text.secondary">
              registros
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
            disabled={loading}
            onClick={handleExport}
          >
            Exportar PDF
          </Button>

          <Tooltip title="Abrir módulo">
            <IconButton
              size="small"
              onClick={() => router.push(def.route)}
              aria-label={`Abrir módulo de ${def.cardLabel.toLowerCase()}`}
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  )
}
