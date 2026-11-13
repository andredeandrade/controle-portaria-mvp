'use client'

import { useState } from 'react'

export function useListSelection<TItem>() {
  const [selectedItem, setSelectedItem] = useState<TItem | null>(null)

  const selectItem = (item: TItem) => {
    setSelectedItem(item)
  }

  const clearSelection = () => {
    setSelectedItem(null)
  }

  return { selectedItem, selectItem, clearSelection }
}
