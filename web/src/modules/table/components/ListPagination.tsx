'use client'

import Pagination from '@mui/material/Pagination'
import Stack from '@mui/material/Stack'

export type ListPaginationState = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

type ListPaginationProps = {
  pagination: ListPaginationState
  onPageChange: (page: number) => void
  disabled?: boolean
}

export function ListPagination({ pagination, onPageChange, disabled = false }: ListPaginationProps) {
  return (
    <Stack
      direction="row"
      justifyContent={{ xs: 'center', sm: 'flex-end' }}
      sx={{ px: { xs: 0.5, sm: 1 } }}
    >
      <Pagination
        page={pagination.page}
        count={pagination.totalPages}
        onChange={(_, value) => onPageChange(value)}
        disabled={disabled}
        siblingCount={1}
        boundaryCount={1}
        sx={{
          '& .MuiPaginationItem-root': {
            minWidth: 30,
            height: 30,
            borderRadius: '8px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'text.secondary',
          },
          '& .MuiPaginationItem-root.Mui-selected': {
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          },
          '& .MuiPaginationItem-root.Mui-selected:hover': {
            bgcolor: 'primary.main',
          },
          '& .MuiPaginationItem-root.Mui-disabled': {
            color: 'text.disabled',
          },
        }}
      />
    </Stack>
  )
}
