import MenuItem from '@mui/material/MenuItem'
import type { TextFieldProps } from '@mui/material/TextField'

import { TextField } from './TextField'

export const PERSON_TYPE_OPTIONS = [
  { label: 'Morador', value: 'morador' },
  { label: 'Visitante', value: 'visitante' },
  { label: 'Prestador de serviço', value: 'prestador_servico' },
] as const

export type PersonTypeValue = (typeof PERSON_TYPE_OPTIONS)[number]['value']

type PersonTypeSelectProps = Omit<TextFieldProps, 'select' | 'children'>

export function PersonTypeSelect({ SelectProps, ...props }: PersonTypeSelectProps) {
  const mergedSelectProps = {
    displayEmpty: true,
    ...SelectProps,
  }

  return (
    <TextField select {...props} SelectProps={mergedSelectProps}>
      <MenuItem value="" disabled>
        Selecione
      </MenuItem>
      {PERSON_TYPE_OPTIONS.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  )
}
