'use client'

import Link from 'next/link'
import { NAV_ITEMS } from './nav-config'
import { SidebarNavItem } from './sidebar-nav-item'
import { UserMenu } from './user-menu'
import { Separator } from '@/components/ui/separator'

interface SidebarProps {
  email: string
}

export function Sidebar({ email }: SidebarProps) {
  const initials = email.charAt(0).toUpperCase()

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-30">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border hover:bg-sidebar-accent transition-colors"
      >
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-primary-foreground">RC</span>
        </div>
        <span className="font-semibold text-sm leading-tight text-sidebar-foreground">Racehorse CMS</span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem key={item.href} item={item} />
        ))}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* User */}
      <div className="p-3 flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-sidebar-primary/30 ring-1 ring-sidebar-primary/40 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-white">{initials}</span>
        </div>
        <UserMenu email={email} variant="sidebar" />
      </div>
    </aside>
  )
}
