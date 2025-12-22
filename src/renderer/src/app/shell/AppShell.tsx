import type { PropsWithChildren } from 'react'
import React from 'react'
import { Link } from '@tanstack/react-router'

import { cn } from '@renderer/shared/lib/cn'

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="h-screen w-screen bg-background text-foreground">
      <div className="mx-auto flex h-full max-w-6xl flex-col">
        <header className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-primary" />
            <div className="leading-tight">
              <div className="text-sm font-semibold">Typey</div>
              <div className="text-xs text-muted-foreground">Telegram-like IM (Electron)</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/chats"
              className={cn(
                'inline-flex h-9 items-center justify-center rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground transition-colors hover:opacity-90'
              )}
            >
              Chats
            </Link>
          </div>
        </header>
        <main className="min-h-0 flex-1">{children}</main>
      </div>
    </div>
  )
}


