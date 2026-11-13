'use client'

import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import { AccessExitRegistrationFeedback } from '@/modules/acessos/components/AccessExitRegistrationFeedback'
import { useAccessListContext } from '@/modules/acessos/context/AccessListContext'
import { DashboardRecentAccessesMobileList } from '@/modules/dashboard/mobile/DashboardRecentAccessesMobileList'

const RECENT_ACCESSES_LIMIT = 4

export function DashboardRecentAccessesContent() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { records, handleOpenExitConfirmation, isLoading, isError, errorMessage, refetch } =
    useAccessListContext()

  const recentRecords = records.slice(0, RECENT_ACCESSES_LIMIT)

  const title = (
    <Typography
      variant="caption"
      sx={{
        color: 'text.secondary',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        fontWeight: 600,
      }}
    >
      Últimos acessos
    </Typography>
  )

  const states = isError ? (
    <Alert
      severity="error"
      sx={{ mt: 2 }}
      action={
        <Button color="inherit" size="small" onClick={() => void refetch()}>
          Tentar novamente
        </Button>
      }
    >
      {errorMessage}
    </Alert>
  ) : isLoading ? (
    <Stack alignItems="center" justifyContent="center" sx={{ py: 4 }}>
      <CircularProgress size={24} />
    </Stack>
  ) : recentRecords.length === 0 ? (
    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
      Nenhum acesso registrado.
    </Typography>
  ) : null

  return (
    <>
      {isMobile ? (
        <Stack spacing={4}>
          {title}

          {states}

          {!isError && !isLoading && recentRecords.length > 0 ? (
            <DashboardRecentAccessesMobileList
              records={recentRecords}
              onRegisterExit={handleOpenExitConfirmation}
            />
          ) : null}
        </Stack>
      ) : (
        <Card sx={{ p: { xs: 2.5, sm: 3 } }}>
          {title}

          {states ??
            (recentRecords.length === 0 ? null : (
              <Stack sx={{ mt: 1 }}>
                {recentRecords.map((record, index) => (
                  <Stack
                    key={record.id}
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{
                      py: 1.5,
                      borderBottom: index < recentRecords.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}
                  >
                    <Stack sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight={700} noWrap>
                        {record.name}
                      </Typography>
                      {record.categoryUnits.map((categoryUnit) => (
                        <Typography
                          key={categoryUnit.id}
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
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
                        onClick={() => handleOpenExitConfirmation(record)}
                      >
                        Registrar saída
                      </Button>
                    )}
                  </Stack>
                ))}
              </Stack>
            ))}
        </Card>
      )}

      <AccessExitRegistrationFeedback />
    </>
  )
}
