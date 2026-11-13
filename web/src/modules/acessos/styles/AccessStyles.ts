'use client'

import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import { styled } from '@mui/material/styles'

export const RegisterExitButton = styled(Button)(({ theme }) => ({
  minWidth: 128,
  borderRadius: 999,
  fontWeight: 700,
  fontSize: '0.8rem',
  lineHeight: 1.3,
  whiteSpace: 'normal',
  textAlign: 'center',
  backgroundColor: theme.palette.common.white,
  color: theme.palette.grey[900],
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: theme.palette.grey[200],
    boxShadow: 'none',
  },
}))

export const MobileRegisterExitButton = styled(Button)(({ theme }) => ({
  width: '100%',
  borderRadius: 999,
  fontWeight: 700,
  fontSize: '0.8125rem',
  borderColor: theme.palette.divider,
  color: theme.palette.text.primary,
  '&:hover': {
    borderColor: theme.palette.text.secondary,
    backgroundColor: theme.palette.action.hover,
  },
}))

export const ExitDialogActions = styled(DialogActions)({
  paddingLeft: 24,
  paddingRight: 24,
  paddingBottom: 20,
})
