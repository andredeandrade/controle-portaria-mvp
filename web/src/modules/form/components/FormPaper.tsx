import MuiPaper from '@mui/material/Paper'
import type { PaperProps as MuiPaperProps } from '@mui/material/Paper'
import { styled } from '@mui/material/styles'

type FormPaperProps = MuiPaperProps

const StyledFormPaper = styled(MuiPaper)({
  padding: 24,
  borderRadius: 8,
  minHeight: 220,
  backgroundColor: 'rgba(15, 23, 42, 0.1)',
  boxShadow: 'none',
  overflow: 'hidden',
})

export function FormPaper({ sx, ...props }: FormPaperProps) {
  return <StyledFormPaper {...props} sx={sx} />
}
