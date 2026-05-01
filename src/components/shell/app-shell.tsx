'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { MobileDrawer } from './mobile-drawer'
import { BottomTabBar } from './bottom-tab-bar'

interface AppShellProps {
  email: string
  children: React.ReactNode
}

export function AppShell({ email, children }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar email={email} />

      {/* Mobile drawer */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        email={email}
      />

      {/* Main content area — offset by sidebar on desktop */}
      <div className="md:pl-60 flex flex-col min-h-screen">
        <Topbar email={email} onMenuClick={() => setDrawerOpen(true)} />

        {/* Page content — add bottom padding on mobile for tab bar */}
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <BottomTabBar />
    </div>
  )
}
