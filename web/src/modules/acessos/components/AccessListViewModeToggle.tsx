'use client'

import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

import { useAccessListContext } from '@/modules/acessos/context/AccessListContext'
import type { AccessListViewMode } from '@/types/acessos'

const VIEW_MODE_OPTIONS: ReadonlyArray<{ label: string; value: AccessListViewMode }> = [
  { label: 'Todos', value: 'all' },
  { label: 'Acesso ativo', value: 'active' },
  { label: 'Saída registrada', value: 'exited' },
]

export function AccessListViewModeToggle() {
  const { viewMode, setViewMode } = useAccessListContext()

  return (
    <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', rowGap: 2 }}>
      {VIEW_MODE_OPTIONS.map((option) => {
        const isSelected = viewMode === option.value

        return (
          <Button
            key={option.value}
            size="small"
            variant={isSelected ? 'contained' : 'outlined'}
            color={isSelected ? 'primary' : 'inherit'}
            onClick={() => setViewMode(option.value)}
            sx={
              isSelected
                ? undefined
                : { color: 'text.primary', borderColor: 'rgba(255, 255, 255, 0.1)' }
            }
          >
            {option.label}
          </Button>
        )
      })}
    </Stack>
  )
}
