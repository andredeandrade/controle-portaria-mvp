'use client'

import Button from '@mui/material/Button'

import { OccurrencesTableRow } from '@/modules/ocorrencias/components/OccurrencesTableRow'
import { OccurrencesTableRowLoader } from '@/modules/ocorrencias/components/OccurrencesTableRowLoader'
import { RegisterOccurrenceButton } from '@/modules/ocorrencias/components/RegisterOccurrenceButton'
import { useOccurrenceListContext } from '@/modules/ocorrencias/context/OccurrenceListContext'
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

export function OccurrencesTable() {
  const {
    records,
    isLoading,
    isError,
    errorMessage,
    refetch: onRetry,
    handleClearFilters,
  } = useOccurrenceListContext()

  return (
    <Table>
      <TableHead>
        <TableHeadCell>Tipo</TableHeadCell>
        <TableHeadCell>Data</TableHeadCell>
        <TableHeadCell>Hora</TableHeadCell>
        <TableHeadCell>Local</TableHeadCell>
        <TableHeadCell align="right">Ações</TableHeadCell>
      </TableHead>
      <TableBody
        isEmpty={!isError && !isLoading && records.length === 0}
        emptyState={
          <ListEmptyState
            title="Nenhuma ocorrência encontrada."
            description="Nenhum registro corresponde à busca realizada. Ajuste os critérios ou registre uma nova ocorrência."
            actions={
              <>
                <Button variant="outlined" onClick={handleClearFilters}>
                  Limpar busca
                </Button>
                <RegisterOccurrenceButton />
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
                title="Não foi possível carregar as ocorrências."
                message={errorMessage}
                onRetry={onRetry}
              />
            </TableCell>
          </TableRow>
        ) : isLoading ? (
          Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
            <OccurrencesTableRowLoader key={index} />
          ))
        ) : (
          records.map((record) => <OccurrencesTableRow key={record.id} record={record} />)
        )}
      </TableBody>
    </Table>
  )
}
