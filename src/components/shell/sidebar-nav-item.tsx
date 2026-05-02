'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { NavItem } from './nav-config'

interface SidebarNavItemProps {
  item: NavItem
  collapsed?: boolean
}

export function SidebarNavItem({ item, collapsed }: SidebarNavItemProps) {
  const pathname = usePathname()
  const isActive =
    item.href === '/'
      ? pathname === '/'
      : pathname === item.href || pathname.startsWith(item.href + '/')

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-sidebar-accent text-sidebar-foreground'
          : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground',
        collapsed && 'justify-center px-2',
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <item.icon
        className={cn('h-5 w-5 shrink-0', isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/50')}
      />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  )
}
