import type { Metadata } from 'next'

import { RegisterEventAccessContent } from '@/modules/eventos/components/RegisterEventAccessContent'

export const metadata: Metadata = {
  title: 'Registrar Acesso ao Evento',
}

export default async function RegistrarAcessoEventoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <RegisterEventAccessContent eventId={id} />
}
