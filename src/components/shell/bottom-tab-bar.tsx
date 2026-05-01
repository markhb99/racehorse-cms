'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './nav-config'

export function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-background border-t h-14 flex items-stretch"
      aria-label="Bottom navigation"
    >
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === '/'
            ? pathname === '/'
            : pathname === item.href || pathname.startsWith(item.href + '/')

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <item.icon
              className={cn('h-5 w-5', isActive && 'text-primary')}
            />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
