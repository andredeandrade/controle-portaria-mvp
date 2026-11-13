'use client'

import type { ReactNode } from 'react'
import MuiTableBody from '@mui/material/TableBody'
import MuiTableCell from '@mui/material/TableCell'
import MuiTableRow from '@mui/material/TableRow'

import { bodyCellSx } from '@/modules/table/styles/TableStyles'

type TableBodyProps = {
  children: ReactNode
  isEmpty: boolean
  emptyState: ReactNode
  colSpan: number
}

export function TableBody({ children, isEmpty, emptyState, colSpan }: TableBodyProps) {
  return (
    <MuiTableBody>
      {isEmpty ? (
        <MuiTableRow>
          <MuiTableCell colSpan={colSpan} sx={bodyCellSx}>
            {emptyState}
          </MuiTableCell>
        </MuiTableRow>
      ) : (
        children
      )}
    </MuiTableBody>
  )
}
