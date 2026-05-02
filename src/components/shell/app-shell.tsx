'use client'

import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { BottomTabBar } from './bottom-tab-bar'

interface AppShellProps {
  email: string
  children: React.ReactNode
}

export function AppShell({ email, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar email={email} />

      {/* Main content area — offset by sidebar on desktop */}
      <div className="md:pl-60 flex flex-col min-h-screen">
        <Topbar email={email} />

        {/* Page content — pb-24 on mobile accounts for tab bar + safe area */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <BottomTabBar />
    </div>
  )
}
