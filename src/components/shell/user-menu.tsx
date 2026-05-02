'use client'

import { LogOut, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut } from '@/app/actions/auth'

interface UserMenuProps {
  email: string
  variant?: 'sidebar' | 'topbar'
}

export function UserMenu({ email, variant = 'topbar' }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={
          variant === 'sidebar'
            ? 'flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-2 py-1 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors'
            : 'flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors'
        }
        aria-label="User menu"
      >
        <span className="min-w-0 flex-1 truncate" title={email}>
          {email}
        </span>
        <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-accent cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
