import Stack from '@mui/material/Stack'
import type { Metadata } from 'next'
import { RelatoriosView } from '@/modules/relatorios/components/RelatoriosView'

export const metadata: Metadata = {
  title: 'Relatórios',
}

export default function RelatoriosPage() {
  return (
    <Stack spacing={{ xs: 5, sm: 6 }} py={{ xs: 3, sm: 5 }}>
      <RelatoriosView />
    </Stack>
  )
}
