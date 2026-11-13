'use client'

import MuiCard from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'

import type { EventVehicleMovementType } from '@/app/api/events/types'
import { TextField, TextFieldLabel, TextFieldStack } from '@/modules/form'
import { MobileFieldLabel } from '@/styles/MobileList.styles'

export type EventAccessVehicleValues = {
  driverName: string
  driverDocument: string
  plate: string
  brandModel: string
  color: string
}

export const EMPTY_EVENT_ACCESS_VEHICLE_VALUES: EventAccessVehicleValues = {
  driverName: '',
  driverDocument: '',
  plate: '',
  brandModel: '',
  color: '',
}

type EventAccessVehicleCardProps = {
  movementType: EventVehicleMovementType
  value: EventAccessVehicleValues
  onChange: (value: EventAccessVehicleValues) => void
  isWalkIn: boolean
  onWalkInChange: (value: boolean) => void
  driverNameError?: string
  driverDocumentError?: string
  plateError?: string
}

export function EventAccessVehicleCard({
  movementType,
  value,
  onChange,
  isWalkIn,
  onWalkInChange,
  driverNameError,
  driverDocumentError,
  plateError,
}: EventAccessVehicleCardProps) {
  const canBeWalkIn = movementType === 'CONVIDADO'
  const requiresDriverFields = movementType !== 'CONVIDADO'

  const patch = (field: keyof EventAccessVehicleValues, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue })
  }

  return (
    <MuiCard>
      <CardContent>
        <Stack spacing={2.5}>
          <MobileFieldLabel variant="caption">Veículo</MobileFieldLabel>

          {canBeWalkIn ? (
            <FormControlLabel
              control={
                <Switch
                  checked={isWalkIn}
                  onChange={(event) => onWalkInChange(event.target.checked)}
                />
              }
              label="Entrada a pé (sem veículo)"
              sx={{ m: 0, alignSelf: 'flex-start' }}
            />
          ) : null}

          {canBeWalkIn && isWalkIn ? null : (
            <Grid container spacing={2}>
            {requiresDriverFields ? (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextFieldStack>
                    <TextFieldLabel required>Motorista</TextFieldLabel>
                    <TextField
                      value={value.driverName}
                      onChange={(event) => patch('driverName', event.target.value)}
                      error={Boolean(driverNameError)}
                      helperText={driverNameError}
                      placeholder="Nome completo"
                    />
                  </TextFieldStack>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextFieldStack>
                    <TextFieldLabel required>CPF</TextFieldLabel>
                    <TextField
                      value={value.driverDocument}
                      onChange={(event) => patch('driverDocument', event.target.value)}
                      error={Boolean(driverDocumentError)}
                      helperText={driverDocumentError}
                      placeholder="000.000.000-00"
                    />
                  </TextFieldStack>
                </Grid>
              </>
            ) : null}

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextFieldStack>
                <TextFieldLabel required>Placa</TextFieldLabel>
                <TextField
                  value={value.plate}
                  onChange={(event) => patch('plate', event.target.value)}
                  error={Boolean(plateError)}
                  helperText={plateError}
                  placeholder="AAA-0000"
                />
              </TextFieldStack>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextFieldStack>
                <TextFieldLabel>Marca/Modelo</TextFieldLabel>
                <TextField
                  value={value.brandModel}
                  onChange={(event) => patch('brandModel', event.target.value)}
                  placeholder="Ex: Honda Civic"
                />
              </TextFieldStack>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextFieldStack>
                <TextFieldLabel>Cor</TextFieldLabel>
                <TextField
                  value={value.color}
                  onChange={(event) => patch('color', event.target.value)}
                  placeholder="Ex: Prata"
                />
              </TextFieldStack>
            </Grid>
            </Grid>
          )}
        </Stack>
      </CardContent>
    </MuiCard>
  )
}
