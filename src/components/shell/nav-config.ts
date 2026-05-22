import {
  LayoutDashboard,
  Trophy,
  BarChart3,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/horses', label: 'Horses', icon: Trophy },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export const TAB_BAR_ITEMS: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/horses', label: 'Horses', icon: Trophy },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
]

/** @deprecated use SIDEBAR_NAV_ITEMS or TAB_BAR_ITEMS */
export const NAV_ITEMS = SIDEBAR_NAV_ITEMS
