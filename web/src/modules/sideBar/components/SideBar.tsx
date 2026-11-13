'use client'

import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { useSidebarRoutes } from '@/hooks/useSidebarRoutes'
import { useLogout } from '@/modules/topBar/hooks/useLogout'

type SideBarProps = {
  onItemClick?: () => void
}

export default function SideBar({ onItemClick }: SideBarProps) {
  const theme = useTheme()
  const itemSelectedBg = alpha(theme.palette.primary.main, 0.14)
  const itemSelectedHoverBg = alpha(theme.palette.primary.main, 0.2)
  const childSelectedBg = alpha(theme.palette.primary.main, 0.14)
  const scrollBarColor = '#334155 transparent'

  const pathname = usePathname() ?? ''
  const router = useRouter()
  const menuItems = useSidebarRoutes()
  const logoutMutation = useLogout()
  const isLoggingOut = logoutMutation.isPending

  async function handleLogout() {
    await logoutMutation.mutateAsync()
    router.push('/')
  }

  const itemButtonSx = {
    borderRadius: '8px',
    color: 'text.secondary',
    minHeight: 40,
    px: '10px',
    '& .MuiListItemIcon-root': { minWidth: 36, color: 'inherit' },
    '&:hover': { backgroundColor: 'action.hover' },
    '&.Mui-selected': {
      backgroundColor: itemSelectedBg,
      color: 'primary.main',
      '& .MuiListItemIcon-root': { color: 'primary.main' },
    },
    '&.Mui-selected:hover': {
      backgroundColor: itemSelectedHoverBg,
    },
  }

  return (
    <Box
      component="aside"
      sx={{
        width: { xs: '100%', md: 256 },
        minWidth: { md: 256 },
        bgcolor: 'background.paper',
        borderRight: { md: '1px solid' },
        borderColor: 'divider',
        height: { xs: 'auto', md: '100%' },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack direction="row" spacing="12px" alignItems="center" sx={{ px: '16px', py: '20px' }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: (theme) => `${theme.shape.borderRadius}px`,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.contrastText',
            fontFamily: 'var(--font-plus-jakarta-sans), "Plus Jakarta Sans", sans-serif',
            fontWeight: 800,
            fontSize: 16,
          }}
        >
          C
        </Box>

        <Typography variant="h6" component="span" noWrap>
          Controle
          <Box component="span" sx={{ color: 'primary.main' }}>
            Portaria
          </Box>
        </Typography>
      </Stack>

      <Divider sx={{ mx: 2 }} />

      {/* Nav principal — cresce para empurrar ações ao rodapé */}
      <List
        sx={{
          px: '8px',
          py: '12px',
          flexGrow: 1,
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: scrollBarColor,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: '#334155', borderRadius: 4 },
        }}
      >
        {menuItems.map((item) => {
          const hasActiveChild = item.children?.some((child) => pathname === child.href) ?? false
          const selected = item.href
            ? pathname === item.href || pathname.startsWith(`${item.href}/`)
            : hasActiveChild
          const Icon = item.IconComponent

          return (
            <Box key={item.label} sx={{ mb: '2px' }}>
              <ListItem disablePadding>
                {item.href ? (
                  <ListItemButton
                    component={Link}
                    href={item.href}
                    selected={selected}
                    onClick={onItemClick}
                    sx={itemButtonSx}
                  >
                    <ListItemIcon>{Icon ? <Icon fontSize="small" /> : null}</ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      slotProps={{
                        primary: { variant: 'body2', fontWeight: selected ? 600 : 400 },
                      }}
                    />
                  </ListItemButton>
                ) : (
                  <ListItemButton
                    disableRipple
                    selected={selected}
                    sx={{ ...itemButtonSx, cursor: 'default' }}
                  >
                    <ListItemIcon>{Icon ? <Icon fontSize="small" /> : null}</ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      slotProps={{
                        primary: { variant: 'body2', fontWeight: selected ? 600 : 400 },
                      }}
                    />
                  </ListItemButton>
                )}
              </ListItem>

              {item.children?.map((child) => {
                const childSelected =
                  pathname === child.href || pathname.startsWith(`${child.href}/`)

                return (
                  <ListItem key={child.href} disablePadding sx={{ mt: '2px' }}>
                    <ListItemButton
                      component={Link}
                      href={child.href}
                      selected={childSelected}
                      onClick={onItemClick}
                      sx={{
                        ...itemButtonSx,
                        ml: '20px',
                        color: childSelected ? 'primary.main' : 'text.secondary',
                        fontSize: '0.8125rem',
                        '& .MuiListItemIcon-root': { minWidth: 24, color: 'inherit' },
                        '&.Mui-selected': {
                          backgroundColor: childSelectedBg,
                        },
                      }}
                    >
                      <ListItemIcon>
                        <Box
                          sx={{
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            backgroundColor: childSelected ? 'primary.main' : 'text.secondary',
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={child.label}
                        slotProps={{
                          primary: {
                            variant: 'body2',
                            fontSize: '0.8125rem',
                            fontWeight: childSelected ? 600 : 400,
                          },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                )
              })}
            </Box>
          )
        })}
      </List>

      {/* Ações de rodapé */}
      <Divider sx={{ mx: 2 }} />
      <List sx={{ px: '8px', py: '8px' }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            disabled={isLoggingOut}
            sx={{
              ...itemButtonSx,
              color: isLoggingOut ? 'text.disabled' : 'error.main',
            }}
          >
            <ListItemIcon>
              {isLoggingOut ? (
                <CircularProgress size={16} sx={{ color: 'inherit' }} />
              ) : (
                <LogoutRoundedIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText
              primary={isLoggingOut ? 'Saindo...' : 'Sair'}
              slotProps={{ primary: { variant: 'body2' } }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  )
}
