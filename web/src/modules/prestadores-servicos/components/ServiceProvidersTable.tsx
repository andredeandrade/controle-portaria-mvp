'use client'

import Button from '@mui/material/Button'

import { RegisterServiceProviderButton } from '@/modules/prestadores-servicos/components/RegisterServiceProviderButton'
import { ServiceProvidersTableRow } from '@/modules/prestadores-servicos/components/ServiceProvidersTableRow'
import { ServiceProvidersTableRowLoader } from '@/modules/prestadores-servicos/components/ServiceProvidersTableRowLoader'
import { useServiceProviderListContext } from '@/modules/prestadores-servicos/context/ServiceProviderListContext'
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

export function ServiceProvidersTable() {
  const {
    records,
    isLoading,
    isError,
    errorMessage,
    refetch: onRetry,
    handleClearFilters,
  } = useServiceProviderListContext()

  return (
    <Table>
      <TableHead>
        <TableHeadCell>Prestador</TableHeadCell>
        <TableHeadCell>Empresa</TableHeadCell>
        <TableHeadCell>Unidade</TableHeadCell>
        <TableHeadCell>Veículo</TableHeadCell>
        <TableHeadCell align="right">Ações</TableHeadCell>
      </TableHead>
      <TableBody
        isEmpty={!isError && !isLoading && records.length === 0}
        emptyState={
          <ListEmptyState
            title="Nenhum prestador de serviço encontrado."
            description="Nenhum registro corresponde à busca realizada. Ajuste os critérios ou cadastre um novo prestador."
            actions={
              <>
                <Button variant="outlined" onClick={handleClearFilters}>
                  Limpar busca
                </Button>
                <RegisterServiceProviderButton />
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
                title="Não foi possível carregar os prestadores de serviço."
                message={errorMessage}
                onRetry={onRetry}
              />
            </TableCell>
          </TableRow>
        ) : isLoading ? (
          Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
            <ServiceProvidersTableRowLoader key={index} />
          ))
        ) : (
          records.map((record) => (
            <ServiceProvidersTableRow key={record.id} record={record} />
          ))
        )}
      </TableBody>
    </Table>
  )
}
