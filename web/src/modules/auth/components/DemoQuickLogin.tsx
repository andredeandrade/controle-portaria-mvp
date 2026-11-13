import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { DEMO_ACCOUNTS, type DemoAccount } from '../demo'

type DemoQuickLoginProps = {
  onSelect: (account: DemoAccount) => void
  disabled?: boolean
}

export function DemoQuickLogin({ onSelect, disabled = false }: DemoQuickLoginProps) {
  return (
    <Stack spacing={2} component="section" aria-label="Contas de demonstração">
      <Divider>
        <Typography variant="caption" color="text.secondary">
          ou entre com uma conta de demonstração
        </Typography>
      </Divider>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 2,
        }}
      >
        {DEMO_ACCOUNTS.map((account) => (
          <Button
            key={account.role}
            type="button"
            variant="outlined"
            disabled={disabled}
            onClick={() => onSelect(account)}
            sx={{ minHeight: 44, lineHeight: 1.25, overflowWrap: 'anywhere' }}
          >
            Entrar como {account.label}
          </Button>
        ))}
      </Box>
    </Stack>
  )
}
