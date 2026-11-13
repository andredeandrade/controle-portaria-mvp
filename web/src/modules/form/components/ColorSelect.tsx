import MenuItem from '@mui/material/MenuItem'
import type { TextFieldProps } from '@mui/material/TextField'

import { TextField } from './TextField'

export const COLOR_OPTIONS = [
  { label: 'Branco', value: 'branco' },
  { label: 'Preto', value: 'preto' },
  { label: 'Prata', value: 'prata' },
  { label: 'Cinza', value: 'cinza' },
  { label: 'Azul', value: 'azul' },
  { label: 'Vermelho', value: 'vermelho' },
  { label: 'Verde', value: 'verde' },
  { label: 'Amarelo', value: 'amarelo' },
  { label: 'Outra cor', value: 'outra_cor' },
] as const

export type ColorValue = (typeof COLOR_OPTIONS)[number]['value']

type ColorSelectProps = Omit<TextFieldProps, 'select' | 'children'>

export function ColorSelect({ SelectProps, ...props }: ColorSelectProps) {
  const mergedSelectProps = {
    displayEmpty: true,
    ...SelectProps,
  }

  return (
    <TextField select {...props} SelectProps={mergedSelectProps}>
      <MenuItem value="" disabled>
        Selecione
      </MenuItem>
      {COLOR_OPTIONS.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  )
}
