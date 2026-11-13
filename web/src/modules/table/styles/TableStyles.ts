import type { SxProps, Theme } from '@mui/material/styles'

export const containerSx: SxProps<Theme> = {
  bgcolor: 'background.paper',
  borderColor: 'rgba(255, 255, 255, 0.06)',
  borderRadius: '18px',
  overflow: 'hidden',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
}

export const headerCellSx: SxProps<Theme> = {
  padding: '10px 14px',
  color: 'text.disabled',
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  borderBottom: '1px solid',
  borderColor: 'rgba(255, 255, 255, 0.06)',
  whiteSpace: 'nowrap',
}

export const bodyCellSx: SxProps<Theme> = {
  padding: '14px',
  color: 'text.primary',
  fontSize: '0.875rem',
  borderBottom: '1px solid',
  borderColor: 'rgba(255, 255, 255, 0.06)',
}

export const rowSx: SxProps<Theme> = {
  '&:hover': {
    bgcolor: 'action.hover',
  },
  '&:last-child td': {
    borderBottom: 'none',
  },
}

/**
 * `SxProps<Theme>` is a union (plain object | function | array), so
 * TypeScript can't statically verify an object spread between two values of
 * that type. Every default/override pair passed through this helper is
 * always a plain style object, so the shallow merge is safe at runtime; the
 * cast documents that known MUI/TypeScript limitation instead of loosening
 * the public prop types to `any`.
 */
export function mergeSx(base: SxProps<Theme>, override?: SxProps<Theme>): SxProps<Theme> {
  return { ...(base as object), ...(override as object) } as SxProps<Theme>
}
