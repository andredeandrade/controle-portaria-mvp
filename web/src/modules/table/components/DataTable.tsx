'use client'

import type { SxProps, Theme } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { flexRender, getCoreRowModel, type ColumnDef, useReactTable } from '@tanstack/react-table'

type DataTableProps<TData> = {
  data: TData[]
  columns: ColumnDef<TData>[]
  emptyMessage?: string
  containerSx?: SxProps<Theme>
  headerCellSx?: SxProps<Theme>
  bodyCellSx?: SxProps<Theme>
  rowSx?: SxProps<Theme>
}

export function DataTable<TData>({
  data,
  columns,
  emptyMessage = 'Nenhum registro encontrado.',
  containerSx,
  headerCellSx,
  bodyCellSx,
  rowSx,
}: DataTableProps<TData>) {
  // TanStack Table ainda é marcado como incompatible-library pelo React Compiler lint.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <TableContainer component={Paper} variant="outlined" sx={containerSx}>
      <Table size="small">
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableCell key={header.id} sx={headerCellSx}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>

        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} hover sx={rowSx}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} sx={bodyCellSx}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} sx={bodyCellSx}>
                <Typography variant="body2" color="text.secondary">
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
