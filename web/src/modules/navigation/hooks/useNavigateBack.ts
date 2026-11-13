'use client'

import { useRouter } from 'next/navigation'

/**
 * Retorna uma funcao que volta para a pagina anterior do historico. Quando nao
 * ha historico (ex.: pagina aberta direto pela URL) navega para `fallbackHref`.
 */
export function useNavigateBack(fallbackHref = '/dashboard', alwaysUseFallback = false) {
  const router = useRouter()

  return () => {
    if (!alwaysUseFallback && window.history.length > 1) {
      router.back()
      return
    }

    router.push(fallbackHref)
  }
}
