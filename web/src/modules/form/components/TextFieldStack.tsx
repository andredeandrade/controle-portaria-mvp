import Stack from '@mui/material/Stack'
import type { StackProps } from '@mui/material/Stack'

type TextFieldStackProps = StackProps

export function TextFieldStack({ spacing = 1.25, ...props }: TextFieldStackProps) {
  return <Stack spacing={spacing} {...props} />
}