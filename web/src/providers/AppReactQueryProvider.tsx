'use client'

import { createQueryClient } from '@/lib/react-query/queryClient'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useState } from 'react'

type AppReactQueryProviderProps = {
  children: ReactNode
}

export function AppReactQueryProvider({ children }: AppReactQueryProviderProps) {
  const [queryClient] = useState(createQueryClient)

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
