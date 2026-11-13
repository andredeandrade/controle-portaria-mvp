'use client'

import type { ReactNode } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import MuiTable from '@mui/material/Table'
import TableContainer from '@mui/material/TableContainer'

import { containerSx, mergeSx } from '@/modules/table/styles/TableStyles'

type TableProps = {
  children: ReactNode
  sx?: SxProps<Theme>
}

export function Table({ children, sx }: TableProps) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={mergeSx(containerSx, sx)}>
      <MuiTable size="small">{children}</MuiTable>
    </TableContainer>
  )
}
