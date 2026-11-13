'use client'

import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type AccessListTableDateTimeCellProps = {
  value: string
}

export function AccessListTableDateTimeCell({ value }: AccessListTableDateTimeCellProps) {
  const [datePart, timePart] = value.split(', ')

  return (
    <Stack spacing={0}>
      <Typography variant="body2" color="text.primary">
        {datePart}
      </Typography>
      {timePart ? (
        <Typography variant="caption" color="text.disabled">
          {timePart}
        </Typography>
      ) : null}
    </Stack>
  )
}
