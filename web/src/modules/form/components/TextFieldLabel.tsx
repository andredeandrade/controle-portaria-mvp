import Typography from '@mui/material/Typography'
import type { TypographyProps } from '@mui/material/Typography'
import type { ReactNode } from 'react'

type TextFieldLabelProps = Omit<TypographyProps, 'children'> & {
  children: ReactNode
  required?: boolean
}

export function TextFieldLabel({ children, required = false, ...props }: TextFieldLabelProps) {
  return (
    <Typography variant="body2" color="text.secondary" {...props}>
      {children}
      {required ? (
        <Typography component="span" color="error.main">
          {' '}
          *
        </Typography>
      ) : null}
    </Typography>
  )
}