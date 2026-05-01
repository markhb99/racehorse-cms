'use client'

import { Trophy } from 'lucide-react'
import Link from 'next/link'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { NAV_ITEMS } from './nav-config'
import { SidebarNavItem } from './sidebar-nav-item'
import { UserMenu } from './user-menu'
import { Separator } from '@/components/ui/separator'

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
  email: string
}

export function MobileDrawer({ open, onClose, email }: MobileDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="left" className="w-72 p-0 bg-zinc-950 text-zinc-50 border-zinc-800">
        <SheetHeader className="px-4 py-4 border-b border-zinc-800">
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2 text-zinc-50"
          >
            <Trophy className="h-6 w-6 text-yellow-400 shrink-0" />
            <span className="font-semibold text-sm">Racehorse CMS</span>
          </Link>
        </SheetHeader>
        <nav className="flex-1 p-2 space-y-0.5" aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) => (
            <div key={item.href} onClick={onClose}>
              <SidebarNavItem item={item} />
            </div>
          ))}
        </nav>
        <Separator className="bg-zinc-800" />
        <div className="p-2">
          <UserMenu email={email} variant="sidebar" />
        </div>
      </SheetContent>
    </Sheet>
  )
}
