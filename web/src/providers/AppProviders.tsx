'use client'

import { AppSnackbarProvider } from './AppSnackbarProvider'
import { AppReactQueryProvider } from './AppReactQueryProvider'
import { AppThemeProvider } from './AppThemeProvider'
import type { ReactNode } from 'react'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AppReactQueryProvider>
      <AppThemeProvider>
        <AppSnackbarProvider>{children}</AppSnackbarProvider>
      </AppThemeProvider>
    </AppReactQueryProvider>
  )
}
