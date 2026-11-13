import MuiTextField from '@mui/material/TextField'
import type { TextFieldProps as MuiTextFieldProps } from '@mui/material/TextField'

type TextFieldProps = MuiTextFieldProps

export function TextField({ fullWidth = true, size = 'small', ...props }: TextFieldProps) {
  return <MuiTextField {...props} fullWidth={fullWidth} size={size} />
}
