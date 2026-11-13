'use client'

import AddRoundedIcon from '@mui/icons-material/AddRounded'
import Button from '@mui/material/Button'
import type { SxProps, Theme } from '@mui/material/styles'
import { useRouter } from 'next/navigation'

import { useCan } from '@/hooks/useCan'

type RegisterOccurrenceButtonProps = {
  fullWidth?: boolean
  size?: 'medium' | 'large'
  sx?: SxProps<Theme>
}

export function RegisterOccurrenceButton({
  fullWidth = false,
  size = 'medium',
  sx,
}: RegisterOccurrenceButtonProps) {
  const router = useRouter()
  const canCreate = useCan('incidents', 'create')

  if (!canCreate) {
    return null
  }

  const handleNavigateToRegister = () => {
    router.push('/ocorrencias/registrar')
  }

  return (
    <Button
      variant="contained"
      color="primary"
      size={size}
      fullWidth={fullWidth}
      startIcon={<AddRoundedIcon fontSize="small" />}
      onClick={handleNavigateToRegister}
      sx={sx}
    >
      Registrar ocorrência
    </Button>
  )
}
