import React from 'react'
import { Link } from '@tanstack/react-router'

import { Button } from '@renderer/shared/ui/button'

export function ChatsPage() {
  return (
    <div className="flex h-full">
      <aside className="w-72 shrink-0 border-r p-4">
        <div className="text-sm font-semibold">Chats</div>
        <div className="mt-3 space-y-2">
          <Link to="/chats/$chatId" params={{ chatId: 'mock-1' }}>
            <Button className="w-full justify-start" variant="secondary">
              mock-1
            </Button>
          </Link>
          <Link to="/chats/$chatId" params={{ chatId: 'mock-2' }}>
            <Button className="w-full justify-start" variant="secondary">
              mock-2
            </Button>
          </Link>
        </div>
      </aside>
      <section className="flex min-w-0 flex-1 items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="text-base font-semibold">选择一个会话</div>
          <div className="mt-2 text-sm text-muted-foreground">
            这里后续会由 React Query + Repository 驱动（mock/SQLite/Server 可切换）。
          </div>
        </div>
      </section>
    </div>
  )
}


