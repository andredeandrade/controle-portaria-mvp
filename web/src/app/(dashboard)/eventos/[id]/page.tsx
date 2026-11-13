import type { Metadata } from 'next'

import { ViewEventContent } from '@/modules/eventos/components/ViewEventContent'

export const metadata: Metadata = {
  title: 'Visualizar Evento',
}

export default async function VisualizarEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <ViewEventContent eventId={id} />
}
