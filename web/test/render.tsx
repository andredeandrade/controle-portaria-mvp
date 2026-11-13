import { ThemeProvider } from '@mui/material/styles'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, renderHook, type RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement, ReactNode } from 'react'

import { theme } from '@/lib/mui'
import { AppSnackbarProvider } from '@/providers/AppSnackbarProvider'

/** QueryClient isolado por teste: sem retry e sem cache entre testes. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity, staleTime: 0 },
      mutations: { retry: false },
    },
  })
}

type ProvidersOptions = {
  queryClient?: QueryClient
}

function createWrapper(queryClient: QueryClient) {
  return function TestProviders({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <AppSnackbarProvider>{children}</AppSnackbarProvider>
        </ThemeProvider>
      </QueryClientProvider>
    )
  }
}

/**
 * Renderiza com os mesmos providers do app (React Query → tema MUI → Snackbar),
 * sem o `AppRouterCacheProvider` (só relevante para SSR do emotion).
 */
export function renderWithProviders(
  ui: ReactElement,
  { queryClient = createTestQueryClient(), ...options }: ProvidersOptions & RenderOptions = {},
) {
  const user = userEvent.setup()

  return {
    user,
    queryClient,
    ...render(ui, { wrapper: createWrapper(queryClient), ...options }),
  }
}

/** `renderHook` com os mesmos providers de `renderWithProviders`. */
export function renderHookWithProviders<Result>(
  hook: () => Result,
  { queryClient = createTestQueryClient() }: ProvidersOptions = {},
) {
  return {
    queryClient,
    ...renderHook(hook, { wrapper: createWrapper(queryClient) }),
  }
}
