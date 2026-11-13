'use client'

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import type { ReactNode } from 'react'
import type { IconButtonProps } from '@mui/material/IconButton'

import { useNavigateBack } from '@/modules/navigation/hooks/useNavigateBack'

type BackToPreviousPageButtonProps = {
  ariaLabel: string
  children?: ReactNode
  fallbackHref?: string
  alwaysUseFallback?: boolean
  iconButtonProps?: Omit<IconButtonProps, 'onClick' | 'aria-label' | 'children'>
}

const StyledBackButton = styled(IconButton)({
  padding: 0,
  color: 'inherit',
  '&:hover': {
    backgroundColor: 'transparent',
  },
})

export function BackToPreviousPageButton({
  children,
  ariaLabel,
  fallbackHref = '/dashboard',
  alwaysUseFallback = false,
  iconButtonProps,
}: BackToPreviousPageButtonProps) {
  const handleBack = useNavigateBack(fallbackHref, alwaysUseFallback)
  const { sx: iconButtonSx, disableRipple, ...restIconButtonProps } = iconButtonProps ?? {}

  return (
    <StyledBackButton
      onClick={handleBack}
      aria-label={ariaLabel}
      size="small"
      disableRipple={disableRipple ?? true}
      sx={iconButtonSx}
      {...restIconButtonProps}
    >
      {children ?? <ArrowBackRoundedIcon fontSize="small" />}
    </StyledBackButton>
  )
}
