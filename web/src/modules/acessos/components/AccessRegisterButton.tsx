'use client'

import AddRoundedIcon from '@mui/icons-material/AddRounded'
import Button from '@mui/material/Button'
import type { SxProps, Theme } from '@mui/material/styles'
import { useRouter } from 'next/navigation'

import { useCan } from '@/hooks/useCan'

type AccessRegisterButtonProps = {
  fullWidth?: boolean
  size?: 'medium' | 'large'
  sx?: SxProps<Theme>
}

export function AccessRegisterButton({
  fullWidth = false,
  size = 'medium',
  sx,
}: AccessRegisterButtonProps) {
  const router = useRouter()
  const canCheckIn = useCan('access-records', 'checkIn')

  if (!canCheckIn) {
    return null
  }

  const handleNavigateToRegister = () => {
    router.push('/acessos/registrar')
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
      Registrar Acesso
    </Button>
  )
}
