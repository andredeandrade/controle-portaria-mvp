import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded'
import Chip from '@mui/material/Chip'

import type { EventVehicleMovementType } from '@/app/api/events/types'

export const MOVEMENT_LABEL: Record<EventVehicleMovementType, string> = {
  CONVIDADO: 'Convidado',
  DESEMBARQUE: 'Desembarque',
  BUSCA: 'Busca de convidado',
}

const MOVEMENT_COLOR: Record<EventVehicleMovementType, 'primary' | 'info' | 'warning'> = {
  CONVIDADO: 'primary',
  DESEMBARQUE: 'info',
  BUSCA: 'warning',
}

export const MOVEMENT_ICON: Record<EventVehicleMovementType, typeof GroupsRoundedIcon> = {
  CONVIDADO: GroupsRoundedIcon,
  DESEMBARQUE: ExitToAppRoundedIcon,
  BUSCA: PersonSearchRoundedIcon,
}

type EventVehicleMovementBadgeProps = {
  movementType: EventVehicleMovementType
  size?: 'small' | 'medium'
}

export function EventVehicleMovementBadge({
  movementType,
  size = 'small',
}: EventVehicleMovementBadgeProps) {
  const Icon = MOVEMENT_ICON[movementType]

  return (
    <Chip
      size={size}
      color={MOVEMENT_COLOR[movementType]}
      variant="outlined"
      icon={<Icon fontSize="small" />}
      label={MOVEMENT_LABEL[movementType]}
    />
  )
}
