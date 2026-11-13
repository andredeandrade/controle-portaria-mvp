'use client'

import type { ReactNode } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'
import MuiTableCell, { type TableCellProps as MuiTableCellProps } from '@mui/material/TableCell'

import { bodyCellSx, mergeSx } from '@/modules/table/styles/TableStyles'

type TableCellProps = {
  children?: ReactNode
  sx?: SxProps<Theme>
  align?: MuiTableCellProps['align']
  colSpan?: number
}

export function TableCell({ children, sx, align, colSpan }: TableCellProps) {
  return (
    <MuiTableCell align={align} colSpan={colSpan} sx={mergeSx(bodyCellSx, sx)}>
      {children}
    </MuiTableCell>
  )
}
