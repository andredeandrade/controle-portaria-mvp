'use client'

import Button from '@mui/material/Button'

import { RegisterVisitorButton } from '@/modules/visitantes/components/RegisterVisitorButton'
import { VisitorsTableRow } from '@/modules/visitantes/components/VisitorsTableRow'
import { VisitorsTableRowLoader } from '@/modules/visitantes/components/VisitorsTableRowLoader'
import { useVisitorListContext } from '@/modules/visitantes/context/VisitorListContext'
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

export function VisitorsTable() {
  const {
    records,
    isLoading,
    isError,
    errorMessage,
    refetch: onRetry,
    handleClearFilters,
  } = useVisitorListContext()

  return (
    <Table>
      <TableHead>
        <TableHeadCell>Visitante</TableHeadCell>
        <TableHeadCell>Autorizado por</TableHeadCell>
        <TableHeadCell>Veículo</TableHeadCell>
        <TableHeadCell>Telefone</TableHeadCell>
        <TableHeadCell align="right">Ações</TableHeadCell>
      </TableHead>
      <TableBody
        isEmpty={!isError && !isLoading && records.length === 0}
        emptyState={
          <ListEmptyState
            title="Nenhum visitante encontrado."
            description="Nenhum registro corresponde à busca realizada. Ajuste os critérios ou cadastre um novo visitante."
            actions={
              <>
                <Button variant="outlined" onClick={handleClearFilters}>
                  Limpar busca
                </Button>
                <RegisterVisitorButton />
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
                title="Não foi possível carregar os visitantes."
                message={errorMessage}
                onRetry={onRetry}
              />
            </TableCell>
          </TableRow>
        ) : isLoading ? (
          Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
            <VisitorsTableRowLoader key={index} />
          ))
        ) : (
          records.map((record) => <VisitorsTableRow key={record.id} record={record} />)
        )}
      </TableBody>
    </Table>
  )
}
