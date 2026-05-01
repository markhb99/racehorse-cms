'use client'

import { LogOut, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
            ? 'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors'
            : 'flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors'
        }
        aria-label="User menu"
      >
        <span
          className="max-w-[150px] truncate"
          title={email}
        >
          {email}
        </span>
        <ChevronDown className="h-3 w-3 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onSelect={async () => {
            await signOut()
          }}
          className="text-destructive focus:text-destructive gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
