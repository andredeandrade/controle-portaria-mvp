'use client'

import AddRoundedIcon from '@mui/icons-material/AddRounded'
import Button from '@mui/material/Button'
import type { SxProps, Theme } from '@mui/material/styles'
import { useRouter } from 'next/navigation'

import { useCan } from '@/hooks/useCan'

type RegisterServiceProviderButtonProps = {
  fullWidth?: boolean
  size?: 'medium' | 'large'
  sx?: SxProps<Theme>
}

export function RegisterServiceProviderButton({
  fullWidth = false,
  size = 'medium',
  sx,
}: RegisterServiceProviderButtonProps) {
  const router = useRouter()
  const canCreate = useCan('service-providers', 'create')

  if (!canCreate) {
    return null
  }

  const handleNavigateToRegister = () => {
    router.push('/prestadores-servicos/cadastrar')
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
      Adicionar prestador
    </Button>
  )
}
