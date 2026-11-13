'use client'

import MuiCard from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { EventVehicleMovementType } from '@/app/api/events/types'
import { MOVEMENT_ICON } from '@/modules/eventos/components/EventVehicleMovementBadge'
import { MobileFieldLabel } from '@/styles/MobileList.styles'

type MovementOption = {
  value: EventVehicleMovementType
  title: string
  description: string
}

const MOVEMENT_OPTIONS: MovementOption[] = [
  {
    value: 'CONVIDADO',
    title: 'Entrada de convidado',
    description:
      'O convidado entra e permanece no evento. Se houver veículo, ele fica registrado como "no local" até a saída ser feita manualmente.',
  },
  {
    value: 'DESEMBARQUE',
    title: 'Desembarque',
    description:
      'O convidado apenas desce do veículo, que segue livre. A saída do veículo é sempre registrada manualmente depois, sem vínculo com convidados.',
  },
  {
    value: 'BUSCA',
    title: 'Busca de convidado',
    description:
      'Um veículo busca um convidado que já está presente no evento. Veículo é obrigatório e só aceita convidados presentes.',
  },
]

type EventAccessTypeCardProps = {
  value: EventVehicleMovementType
  onChange: (value: EventVehicleMovementType) => void
}

export function EventAccessTypeCard({ value, onChange }: EventAccessTypeCardProps) {
  const selectedOption =
    MOVEMENT_OPTIONS.find((option) => option.value === value) ?? MOVEMENT_OPTIONS[0]
  const SelectedIcon = MOVEMENT_ICON[selectedOption.value]

  return (
    <MuiCard>
      <CardContent>
        <Stack spacing={3}>
          <MobileFieldLabel variant="caption">Tipo de acesso</MobileFieldLabel>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1.5, sm: 2.5 }}
            sx={{ rowGap: { xs: 0, sm: 1.5 }, flexWrap: { xs: 'nowrap', sm: 'wrap' } }}
          >
            {MOVEMENT_OPTIONS.map((option) => {
              const isSelected = value === option.value

              return (
                <Typography
                  key={option.value}
                  component="button"
                  type="button"
                  onClick={() => onChange(option.value)}
                  variant="body2"
                  sx={{
                    px: 3.5,
                    py: 2,
                    borderRadius: 999,
                    border: '1px solid',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    bgcolor: isSelected ? 'primary.main' : 'transparent',
                    color: isSelected ? 'primary.contrastText' : 'text.primary',
                    fontWeight: 700,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    width: { xs: '100%', sm: 'auto' },
                    textAlign: 'center',
                  }}
                >
                  {option.title}
                </Typography>
              )
            })}
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <SelectedIcon color="primary" fontSize="small" />
            <Typography variant="caption" color="text.secondary">
              {selectedOption.description}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </MuiCard>
  )
}
