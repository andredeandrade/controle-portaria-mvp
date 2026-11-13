'use client'

import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import AppBar from '@mui/material/AppBar'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

import { UserRole } from '@/app/api/auth/me/types'
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser'

type TopBarProps = {
  drawerWidth: number
  onOpenMenu: () => void
}

function getRoleLabel(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return 'Administrador'
    case UserRole.GESTOR:
      return 'Gestor'
    case UserRole.SINDICO:
      return 'Síndico'
    case UserRole.SEGURANCA:
      return 'Segurança'
  }
}

export default function TopBar({ drawerWidth, onOpenMenu }: TopBarProps) {
  const { data: user, isPending, isError } = useAuthenticatedUser()

  const userName = user?.name || (isPending ? 'Carregando...' : 'Usuário')
  const roleLabel = user ? getRoleLabel(user.role) : isError ? 'Perfil indisponível' : 'Segurança'

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        ml: { md: `${drawerWidth}px` },
        width: { md: `calc(100% - ${drawerWidth}px)` },
        bgcolor: 'background.default',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.secondary',
      }}
    >
      <Toolbar sx={{ minHeight: 64, px: { xs: '12px', md: '24px' } }}>
        <IconButton
          color="inherit"
          onClick={onOpenMenu}
          sx={{ display: { md: 'none' }, mr: 1, color: 'text.primary' }}
        >
          <MenuRoundedIcon />
        </IconButton>

        {/* Empurra os ícones para a direita */}
        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing="12px" alignItems="center">
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'background.paper',
              color: 'text.secondary',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <PersonRoundedIcon sx={{ fontSize: 18 }} />
          </Avatar>

          <Box sx={{ minWidth: 0, display: { xs: 'none', sm: 'block' } }}>
            <Typography
              variant="subtitle2"
              noWrap
              sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.875rem' }}
            >
              {userName}
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{ color: 'text.secondary', fontWeight: 400, lineHeight: 1.4 }}
              component="p"
            >
              {roleLabel}
            </Typography>
          </Box>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
