'use client'

import Button from '@mui/material/Button'

import { EventsTableRow } from '@/modules/eventos/components/EventsTableRow'
import { EventsTableRowLoader } from '@/modules/eventos/components/EventsTableRowLoader'
import { RegisterEventButton } from '@/modules/eventos/components/RegisterEventButton'
import { useEventListContext } from '@/modules/eventos/context/EventListContext'
import { ListEmptyState } from '@/modules/table/components/ListEmptyState'
import { ListErrorState } from '@/modules/table/components/ListErrorState'
import { Table } from '@/modules/table/components/Table'
import { TableBody } from '@/modules/table/components/TableBody'
import { TableCell } from '@/modules/table/components/TableCell'
import { TableHead } from '@/modules/table/components/TableHead'
import { TableHeadCell } from '@/modules/table/components/TableHeadCell'
import { TableRow } from '@/modules/table/components/TableRow'

const SKELETON_ROW_COUNT = 5
const COLUMN_COUNT = 6

export function EventsTable() {
  const {
    records,
    isLoading,
    isError,
    errorMessage,
    refetch: onRetry,
    handleClearFilters,
  } = useEventListContext()

  return (
    <Table>
      <TableHead>
        <TableHeadCell>Evento</TableHeadCell>
        <TableHeadCell>Data e Horário</TableHeadCell>
        <TableHeadCell>Unidade</TableHeadCell>
        <TableHeadCell>Responsável</TableHeadCell>
        <TableHeadCell>Convidados</TableHeadCell>
        <TableHeadCell align="right">Ações</TableHeadCell>
      </TableHead>
      <TableBody
        isEmpty={!isError && !isLoading && records.length === 0}
        emptyState={
          <ListEmptyState
            title="Nenhum evento encontrado."
            description="Nenhum registro corresponde à busca realizada. Ajuste os critérios ou registre um novo evento."
            actions={
              <>
                <Button variant="outlined" onClick={handleClearFilters}>
                  Limpar busca
                </Button>
                <RegisterEventButton />
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
                title="Não foi possível carregar os eventos."
                message={errorMessage}
                onRetry={onRetry}
              />
            </TableCell>
          </TableRow>
        ) : isLoading ? (
          Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
            <EventsTableRowLoader key={index} />
          ))
        ) : (
          records.map((record) => <EventsTableRow key={record.id} record={record} />)
        )}
      </TableBody>
    </Table>
  )
}
