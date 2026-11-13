import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'

export type EventGuestStatus = 'aguardando' | 'presente' | 'saiu'

/**
 * Deriva a situação do convidado a partir dos campos `checkInAt`/`checkOutAt`.
 * O backend não expõe um campo de status explícito.
 */
export function getEventGuestStatus(checkInAt: string | null, checkOutAt: string | null): EventGuestStatus {
  if (!checkInAt) {
    return 'aguardando'
  }

  if (!checkOutAt) {
    return 'presente'
  }

  return 'saiu'
}

const STATUS_LABEL: Record<EventGuestStatus, string> = {
  aguardando: 'Aguardando',
  presente: 'Presente',
  saiu: 'Saiu',
}

const STATUS_COLOR: Record<EventGuestStatus, 'warning' | 'success' | 'default'> = {
  aguardando: 'warning',
  presente: 'success',
  saiu: 'default',
}

type EventGuestStatusChipProps = {
  checkInAt: string | null
  checkOutAt: string | null
  isAdHoc?: boolean
  showAdHocBadge?: boolean
  size?: 'small' | 'medium'
}

export function EventGuestStatusChip({
  checkInAt,
  checkOutAt,
  isAdHoc = false,
  showAdHocBadge = false,
  size = 'small',
}: EventGuestStatusChipProps) {
  const status = getEventGuestStatus(checkInAt, checkOutAt)

  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" rowGap={1}>
      <Chip size={size} color={STATUS_COLOR[status]} label={STATUS_LABEL[status]} />

      {showAdHocBadge && isAdHoc ? (
        <Chip size={size} variant="outlined" label="Autorizado na portaria" />
      ) : null}
    </Stack>
  )
}
