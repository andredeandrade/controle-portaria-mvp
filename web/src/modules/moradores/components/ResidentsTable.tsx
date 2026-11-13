'use client'

import Button from '@mui/material/Button'

import { RegisterResidentButton } from '@/modules/moradores/components/RegisterResidentButton'
import { ResidentsTableRow } from '@/modules/moradores/components/ResidentsTableRow'
import { ResidentsTableRowLoader } from '@/modules/moradores/components/ResidentsTableRowLoader'
import { useResidentListContext } from '@/modules/moradores/context/ResidentListContext'
import { ListEmptyState } from '@/modules/table/components/ListEmptyState'
import { ListErrorState } from '@/modules/table/components/ListErrorState'
import { Table } from '@/modules/table/components/Table'
import { TableBody } from '@/modules/table/components/TableBody'
import { TableCell } from '@/modules/table/components/TableCell'
import { TableHead } from '@/modules/table/components/TableHead'
import { TableHeadCell } from '@/modules/table/components/TableHeadCell'
import { TableRow } from '@/modules/table/components/TableRow'

const SKELETON_ROW_COUNT = 5
const COLUMN_COUNT = 5

export function ResidentsTable() {
  const {
    records,
    isLoading,
    isError,
    errorMessage,
    refetch: onRetry,
    handleClearFilters,
  } = useResidentListContext()

  return (
    <Table>
      <TableHead>
        <TableHeadCell>Morador</TableHeadCell>
        <TableHeadCell>Unidades</TableHeadCell>
        <TableHeadCell>Categoria</TableHeadCell>
        <TableHeadCell>Veículos</TableHeadCell>
        <TableHeadCell align="right">Ações</TableHeadCell>
      </TableHead>
      <TableBody
        isEmpty={!isError && !isLoading && records.length === 0}
        emptyState={
          <ListEmptyState
            title="Nenhum morador encontrado."
            description="Nenhum registro corresponde à busca realizada. Ajuste os critérios ou cadastre um novo morador."
            actions={
              <>
                <Button variant="outlined" onClick={handleClearFilters}>
                  Limpar busca
                </Button>
                <RegisterResidentButton />
              </>
            }
          />
        }
        colSpan={COLUMN_COUNT}
      >
        {isError ? (
          <TableRow>
            <TableCell colSpan={COLUMN_COUNT}>
              <ListErrorState
                title="Não foi possível carregar os moradores."
                message={errorMessage}
                onRetry={onRetry}
              />
            </TableCell>
          </TableRow>
        ) : isLoading ? (
          Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
            <ResidentsTableRowLoader key={index} />
          ))
        ) : (
          records.map((record) => <ResidentsTableRow key={record.id} record={record} />)
        )}
      </TableBody>
    </Table>
  )
}
