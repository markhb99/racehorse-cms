'use client'

import { Trophy } from 'lucide-react'
import Link from 'next/link'
import { NAV_ITEMS } from './nav-config'
import { SidebarNavItem } from './sidebar-nav-item'
import { UserMenu } from './user-menu'
import { Separator } from '@/components/ui/separator'

interface SidebarProps {
  email: string
}

export function Sidebar({ email }: SidebarProps) {
  return (
    <aside className="hidden md:flex md:w-60 md:flex-col bg-zinc-950 text-zinc-50 fixed inset-y-0 left-0 z-30">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 px-4 py-4 border-b border-zinc-800 hover:bg-zinc-900 transition-colors"
      >
        <Trophy className="h-6 w-6 text-yellow-400 shrink-0" />
        <span className="font-semibold text-sm leading-tight">Racehorse CMS</span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem key={item.href} item={item} />
        ))}
      </nav>

      <Separator className="bg-zinc-800" />

      {/* User */}
      <div className="p-2">
        <UserMenu email={email} variant="sidebar" />
      </div>
    </aside>
  )
}
