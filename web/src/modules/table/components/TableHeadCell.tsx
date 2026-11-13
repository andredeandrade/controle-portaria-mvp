'use client'

import type { ReactNode } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'
import MuiTableCell, { type TableCellProps } from '@mui/material/TableCell'

import { headerCellSx, mergeSx } from '@/modules/table/styles/TableStyles'

type TableHeadCellProps = {
  children?: ReactNode
  sx?: SxProps<Theme>
  align?: TableCellProps['align']
}

export function TableHeadCell({ children, sx, align }: TableHeadCellProps) {
  return (
    <MuiTableCell align={align} sx={mergeSx(headerCellSx, sx)}>
      {children}
    </MuiTableCell>
  )
}
