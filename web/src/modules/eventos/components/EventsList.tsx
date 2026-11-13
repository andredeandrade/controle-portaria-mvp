'use client'

import { EventsListContent } from '@/modules/eventos/components/EventsListContent'
import { EventListProvider } from '@/modules/eventos/providers/EventListProvider'

export function EventsList() {
  return (
    <EventListProvider>
      <EventsListContent />
    </EventListProvider>
  )
}
