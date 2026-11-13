'use client'

import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import type { MouseEvent, ReactNode } from 'react'
import { Fragment, useState } from 'react'

export type ListItemActionMenuOption = {
  id: string
  label: string
  onClick: () => void
  disabled?: boolean
  icon?: ReactNode
  dividerBefore?: boolean
  tone?: 'default' | 'danger'
}

type ListItemActionsMenuProps = {
  items: ListItemActionMenuOption[]
  ariaLabel?: string
}

export function ListItemActionsMenu({
  items,
  ariaLabel = 'Abrir ações do item',
}: ListItemActionsMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  if (items.length === 0) {
    return null
  }

  const isOpen = Boolean(anchorEl)

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleItemClick = (onClick: () => void) => {
    handleClose()
    onClick()
  }

  return (
    <>
      <IconButton
        aria-label={ariaLabel}
        onClick={handleOpen}
        size="small"
        sx={{
          color: 'text.secondary',
          borderRadius: 2,
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <MoreVertRoundedIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          list: {
            sx: { py: 0.75 },
          },
          paper: {
            elevation: 4,
            sx: {
              mt: 0.5,
              minWidth: 216,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            },
          },
        }}
      >
        {items.map((item) => (
          <Fragment key={item.id}>
            {item.dividerBefore ? <Divider sx={{ my: 0.75 }} /> : null}
            <MenuItem
              onClick={() => handleItemClick(item.onClick)}
              disabled={item.disabled}
              sx={{
                gap: 1.5,
                px: 2,
                py: 1.25,
                color: item.tone === 'danger' ? 'error.main' : 'text.primary',
                '& .MuiSvgIcon-root': {
                  fontSize: '1.125rem',
                },
              }}
            >
              {item.icon}
              {item.label}
            </MenuItem>
          </Fragment>
        ))}
      </Menu>
    </>
  )
}
