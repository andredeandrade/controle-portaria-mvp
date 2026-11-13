'use client'

import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

import { type PersonSearchOption, usePersonSearch } from '@/modules/acessos/hooks/usePersonSearch'
import { type AccessPersonTypeValue, TextField } from '@/modules/form'

type PersonSearchAutocompleteProps = {
  category: AccessPersonTypeValue | ''
  onSelect: (option: PersonSearchOption) => void
}

function formatUnit(unit: string) {
  const trimmedUnit = unit.trim()

  if (!trimmedUnit) {
    return ''
  }

  return /^\d/.test(trimmedUnit) ? `Apto ${trimmedUnit}` : trimmedUnit
}

export function PersonSearchAutocomplete({ category, onSelect }: PersonSearchAutocompleteProps) {
  const [inputValue, setInputValue] = useState('')
  const { options, isFetching, isError } = usePersonSearch(category, inputValue)

  const getNoOptionsText = () => {
    if (inputValue.trim().length < 2) {
      return 'Digite ao menos 2 caracteres para buscar.'
    }

    if (isError) {
      return 'Erro ao buscar cadastros. Tente novamente.'
    }

    return 'Nenhum cadastro encontrado.'
  }

  return (
    <Autocomplete<PersonSearchOption, false, false, false>
      options={options}
      getOptionLabel={(option) => option.name}
      getOptionKey={(option) => option.key}
      filterOptions={(options) => options}
      isOptionEqualToValue={(option, value) => option.key === value.key}
      value={null}
      inputValue={inputValue}
      onInputChange={(_, value) => setInputValue(value)}
      onChange={(_, option) => {
        if (option) {
          onSelect(option)
        }
      }}
      disabled={category === ''}
      loading={isFetching}
      loadingText="Buscando..."
      noOptionsText={getNoOptionsText()}
      renderInput={(params) => <TextField {...params} placeholder="Nome, CPF ou unidade..." />}
      slotProps={{
        listbox: { sx: { py: 0 } },
      }}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props
        const details = [formatUnit(option.unit), option.companyName].filter(Boolean).join(' • ')

        return (
          <Stack
            component="li"
            key={key}
            {...optionProps}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1.5}
            sx={{
              py: 1.5,
              px: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              '&:last-of-type': { borderBottom: 'none' },
            }}
          >
            <Stack spacing={0.25} minWidth={0}>
              <Typography variant="body2" fontWeight={600} color="text.primary" noWrap>
                {option.name}
              </Typography>
              {details ? (
                <Typography variant="caption" color="text.disabled" noWrap>
                  {details}
                </Typography>
              ) : null}
            </Stack>

            {option.badge ? (
              <Chip label={option.badge} size="small" color="primary" variant="outlined" />
            ) : null}
          </Stack>
        )
      }}
    />
  )
}
