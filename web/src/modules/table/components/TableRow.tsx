'use client'

import type { ReactNode } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'
import MuiTableRow from '@mui/material/TableRow'

import { mergeSx, rowSx } from '@/modules/table/styles/TableStyles'

type TableRowProps = {
  children: ReactNode
  sx?: SxProps<Theme>
}

export function TableRow({ children, sx }: TableRowProps) {
  return (
    <MuiTableRow hover sx={mergeSx(rowSx, sx)}>
      {children}
    </MuiTableRow>
  )
}
