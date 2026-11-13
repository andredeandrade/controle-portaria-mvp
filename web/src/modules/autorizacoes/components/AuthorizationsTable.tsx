'use client'

import Button from '@mui/material/Button'

import { AuthorizationsTableRow } from '@/modules/autorizacoes/components/AuthorizationsTableRow'
import { AuthorizationsTableRowLoader } from '@/modules/autorizacoes/components/AuthorizationsTableRowLoader'
import { RegisterAuthorizationButton } from '@/modules/autorizacoes/components/RegisterAuthorizationButton'
import { useAuthorizationListContext } from '@/modules/autorizacoes/context/AuthorizationListContext'
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

export function AuthorizationsTable() {
  const {
    records,
    isLoading,
    isError,
    errorMessage,
    refetch: onRetry,
    handleClearFilters,
  } = useAuthorizationListContext()

  return (
    <Table>
      <TableHead>
        <TableHeadCell>Nome</TableHeadCell>
        <TableHeadCell>CPF/RG/CNPJ</TableHeadCell>
        <TableHeadCell>Válido de</TableHeadCell>
        <TableHeadCell>Válido até</TableHeadCell>
        <TableHeadCell>Unidade</TableHeadCell>
        <TableHeadCell align="right">Ações</TableHeadCell>
      </TableHead>
      <TableBody
        isEmpty={!isError && !isLoading && records.length === 0}
        emptyState={
          <ListEmptyState
            title="Nenhuma autorização encontrada."
            description="Nenhum registro corresponde à busca realizada. Ajuste os critérios ou cadastre uma nova autorização."
            actions={
              <>
                <Button variant="outlined" onClick={handleClearFilters}>
                  Limpar busca
                </Button>
                <RegisterAuthorizationButton />
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
                title="Não foi possível carregar as autorizações."
                message={errorMessage}
                onRetry={onRetry}
              />
            </TableCell>
          </TableRow>
        ) : isLoading ? (
          Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
            <AuthorizationsTableRowLoader key={index} />
          ))
        ) : (
          records.map((record) => <AuthorizationsTableRow key={record.id} record={record} />)
        )}
      </TableBody>
    </Table>
  )
}
