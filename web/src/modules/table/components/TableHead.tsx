'use client'

import type { ReactNode } from 'react'
import MuiTableHead from '@mui/material/TableHead'
import MuiTableRow from '@mui/material/TableRow'

type TableHeadProps = {
  children: ReactNode
}

export function TableHead({ children }: TableHeadProps) {
  return (
    <MuiTableHead>
      <MuiTableRow>{children}</MuiTableRow>
    </MuiTableHead>
  )
}
