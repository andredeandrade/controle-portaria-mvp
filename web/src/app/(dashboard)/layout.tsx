'use client'

import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Toolbar from '@mui/material/Toolbar'
import type { ReactNode } from 'react'
import { useState } from 'react'

import SideBar from '@/modules/sideBar'
import TopBar from '@/modules/topBar'

const drawerWidth = 256

type DashboardLayoutProps = {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <TopBar
        drawerWidth={drawerWidth}
        onOpenMenu={() => {
          setMobileOpen(true)
        }}
      />

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 }, height: '100%' }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => {
            setMobileOpen(false)
          }}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
            },
          }}
        >
          <SideBar
            onItemClick={() => {
              setMobileOpen(false)
            }}
          />
        </Drawer>

        <Box sx={{ display: { xs: 'none', md: 'block' }, height: '100%' }}>
          <SideBar />
        </Box>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          px: { xs: 5, md: 6 },
          py: 0,
          height: '100%',
          overflowY: 'auto',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar sx={{ minHeight: 64 }} />
        {children}
      </Box>
    </Box>
  )
}
