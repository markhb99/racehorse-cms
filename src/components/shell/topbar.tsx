'use client'

import { usePathname } from 'next/navigation'
import { UserMenu } from './user-menu'
import { NAV_ITEMS } from './nav-config'

interface TopbarProps {
  email: string
}

function usePageTitle() {
  const pathname = usePathname()
  const match = NAV_ITEMS.find((item) =>
    item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(item.href + '/'),
  )
  return match?.label ?? 'Racehorse CMS'
}

export function Topbar({ email }: TopbarProps) {
  const title = usePageTitle()

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/95 backdrop-blur px-4 md:px-6">
      {/* Page title — mobile only */}
      <span className="md:hidden font-semibold text-sm">{title}</span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User menu — desktop only */}
      <div className="hidden md:block">
        <UserMenu email={email} variant="topbar" />
      </div>
    </header>
  )
}
