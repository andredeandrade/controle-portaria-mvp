'use client'

import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import type { ReactNode, SyntheticEvent } from 'react'
import { createContext, useContext, useMemo, useState } from 'react'

type SnackbarSeverity = 'success' | 'error' | 'info' | 'warning'

type SnackbarState = {
  open: boolean
  message: string
  severity: SnackbarSeverity
  key: number
}

type ShowSnackbarInput = {
  message: string
  severity: SnackbarSeverity
}

type AppSnackbarContextValue = {
  showSnackbar: ({ message, severity }: ShowSnackbarInput) => void
  showSuccess: (message: string) => void
  showError: (message: string) => void
  showInfo: (message: string) => void
  showWarning: (message: string) => void
}

const AppSnackbarContext = createContext<AppSnackbarContextValue | null>(null)

type AppSnackbarProviderProps = {
  children: ReactNode
}

export function AppSnackbarProvider({ children }: AppSnackbarProviderProps) {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
    key: 0,
  })

  const showSnackbar = ({ message, severity }: ShowSnackbarInput) => {
    setSnackbar({
      open: true,
      message,
      severity,
      key: Date.now(),
    })
  }

  const handleClose = (_event?: Event | SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }

    setSnackbar((current) => ({ ...current, open: false }))
  }

  const value = useMemo<AppSnackbarContextValue>(
    () => ({
      showSnackbar,
      showSuccess: (message) => {
        showSnackbar({ message, severity: 'success' })
      },
      showError: (message) => {
        showSnackbar({ message, severity: 'error' })
      },
      showInfo: (message) => {
        showSnackbar({ message, severity: 'info' })
      },
      showWarning: (message) => {
        showSnackbar({ message, severity: 'warning' })
      },
    }),
    [],
  )

  return (
    <AppSnackbarContext.Provider value={value}>
      {children}

      <Snackbar
        key={snackbar.key}
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppSnackbarContext.Provider>
  )
}

/**
 * Exibe notificacoes globais de feedback na aplicacao.
 */
export function useAppSnackbar() {
  const context = useContext(AppSnackbarContext)

  if (!context) {
    throw new Error('useAppSnackbar deve ser usado dentro de AppSnackbarProvider.')
  }

  return context
}
