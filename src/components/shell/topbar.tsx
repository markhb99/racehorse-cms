'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserMenu } from './user-menu'

interface TopbarProps {
  email: string
  onMenuClick: () => void
}

export function Topbar({ email, onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/95 backdrop-blur px-4 md:px-6">
      {/* Hamburger — mobile only */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden shrink-0"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User menu — desktop only in topbar */}
      <div className="hidden md:block">
        <UserMenu email={email} variant="topbar" />
      </div>
    </header>
  )
}
