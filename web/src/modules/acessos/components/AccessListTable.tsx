'use client'

import Button from '@mui/material/Button'

import { AccessListTableRow } from '@/modules/acessos/components/AccessListTableRow'
import { AccessListTableRowLoader } from '@/modules/acessos/components/AccessListTableRowLoader'
import { AccessRegisterButton } from '@/modules/acessos/components/AccessRegisterButton'
import { useAccessListContext } from '@/modules/acessos/context/AccessListContext'
import { ListEmptyState } from '@/modules/table/components/ListEmptyState'
import { ListErrorState } from '@/modules/table/components/ListErrorState'
import { Table } from '@/modules/table/components/Table'
import { TableBody } from '@/modules/table/components/TableBody'
import { TableCell } from '@/modules/table/components/TableCell'
import { TableHead } from '@/modules/table/components/TableHead'
import { TableHeadCell } from '@/modules/table/components/TableHeadCell'
import { TableRow } from '@/modules/table/components/TableRow'

const SKELETON_ROW_COUNT = 5

export function AccessListTable() {
  const {
    records,
    showExitActions: showActions,
    handleOpenExitConfirmation: onRegisterExit,
    isLoading,
    isError,
    errorMessage,
    refetch: onRetry,
    handleClearFilters,
  } = useAccessListContext()

  const columnCount = showActions ? 7 : 6

  return (
    <Table>
      <TableHead>
        <TableHeadCell>Nome</TableHeadCell>
        <TableHeadCell>Locomoção</TableHeadCell>
        <TableHeadCell>Placa</TableHeadCell>
        <TableHeadCell>Entrada</TableHeadCell>
        <TableHeadCell>Saída</TableHeadCell>
        <TableHeadCell>Status</TableHeadCell>
        {showActions ? <TableHeadCell /> : null}
      </TableHead>
      <TableBody
        isEmpty={!isError && !isLoading && records.length === 0}
        emptyState={
          <ListEmptyState
            title="Nenhum acesso encontrado."
            description="Nenhum registro corresponde à busca ou ao filtro selecionado. Ajuste os critérios ou registre um novo acesso."
            actions={
              <>
                <Button variant="outlined" onClick={handleClearFilters}>
                  Limpar filtros
                </Button>
                <AccessRegisterButton />
              </>
            }
          />
        }
        colSpan={columnCount}
      >
        {isError ? (
          <TableRow>
            <TableCell colSpan={columnCount}>
              <ListErrorState
                title="Não foi possível carregar os acessos."
                message={errorMessage}
                onRetry={onRetry}
              />
            </TableCell>
          </TableRow>
        ) : isLoading ? (
          Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
            <AccessListTableRowLoader key={index} showActions={showActions} />
          ))
        ) : (
          records.map((record) => (
            <AccessListTableRow
              key={record.id}
              record={record}
              showActions={showActions}
              onRegisterExit={onRegisterExit}
            />
          ))
        )}
      </TableBody>
    </Table>
  )
}
