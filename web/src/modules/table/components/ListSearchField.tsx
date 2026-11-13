'use client'

import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import InputAdornment from '@mui/material/InputAdornment'
import type { SxProps, Theme } from '@mui/material/styles'
import type { ChangeEvent } from 'react'

import { TextField } from '@/modules/form'

type ListSearchFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  fullWidth?: boolean
  sx?: SxProps<Theme>
}

export function ListSearchField({
  value,
  onChange,
  placeholder = 'Buscar na listagem',
  fullWidth = false,
  sx,
}: ListSearchFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  return (
    <TextField
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      fullWidth={fullWidth}
      sx={[
        {
          '& .MuiInputBase-input': {
            color: 'text.primary',
          },
          '& .MuiInputBase-input::placeholder': {
            color: 'text.disabled',
            opacity: 1,
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon fontSize="small" sx={{ color: 'grey.600' }} />
            </InputAdornment>
          ),
        },
      }}
    />
  )
}
