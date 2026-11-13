import MenuItem from '@mui/material/MenuItem'
import type { TextFieldProps } from '@mui/material/TextField'

import { TextField } from './TextField'

export const LOCOMOTION_OPTIONS = [
  { label: 'A pe', value: 'a_pe' },
  { label: 'Carro', value: 'carro' },
  { label: 'Moto', value: 'moto' },
  { label: 'Bicicleta', value: 'bicicleta' },
  { label: 'Caminhao', value: 'caminhao' },
  { label: 'Outro', value: 'outro' },
] as const

export type LocomotionValue = (typeof LOCOMOTION_OPTIONS)[number]['value']

type LocomotionSelectProps = Omit<TextFieldProps, 'select' | 'children'>

export function LocomotionSelect({ SelectProps, ...props }: LocomotionSelectProps) {
  const mergedSelectProps = {
    displayEmpty: true,
    ...SelectProps,
  }

  return (
    <TextField select {...props} SelectProps={mergedSelectProps}>
      <MenuItem value="" disabled>
        Selecione
      </MenuItem>
      {LOCOMOTION_OPTIONS.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  )
}
