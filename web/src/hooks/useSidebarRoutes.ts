'use client'

import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded'
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import EventRoundedIcon from '@mui/icons-material/EventRounded'
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded'
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded'
import type { ElementType } from 'react'

import { UserRole } from '@/app/api/auth/me/types'
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser'

export type SidebarChildRoute = {
  label: string
  href: string
}

export type SidebarRoute = {
  label: string
  href?: string
  IconComponent?: ElementType
  children?: SidebarChildRoute[]
}

const sidebarRoutesConfig: SidebarRoute[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    IconComponent: DashboardRoundedIcon,
  },
  {
    label: 'Acessos',
    href: '/acessos',
    IconComponent: SwapHorizRoundedIcon,
  },
  {
    label: 'Moradores',
    href: '/moradores',
    IconComponent: ApartmentRoundedIcon,
  },
  {
    label: 'Visitantes',
    href: '/visitantes',
    IconComponent: BadgeOutlinedIcon,
  },
  {
    label: 'Prestadores de Serviços',
    href: '/prestadores-servicos',
    IconComponent: Groups2RoundedIcon,
  },
  {
    label: 'Eventos',
    href: '/eventos',
    IconComponent: EventRoundedIcon,
  },
  {
    label: 'Ocorrências',
    href: '/ocorrencias',
    IconComponent: ReportProblemRoundedIcon,
  },
  {
    label: 'Autorizações',
    href: '/autorizacoes',
    IconComponent: AssignmentTurnedInRoundedIcon,
  },
  {
    label: 'Relatórios',
    href: '/relatorios',
    IconComponent: HistoryRoundedIcon,
  },
]

export function useSidebarRoutes(): SidebarRoute[] {
  const { data: user } = useAuthenticatedUser()

  if (user?.role === UserRole.SEGURANCA) {
    return sidebarRoutesConfig.filter((route) => route.href !== '/relatorios')
  }

  return sidebarRoutesConfig
}
