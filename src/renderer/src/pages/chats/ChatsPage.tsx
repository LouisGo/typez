import React from 'react'
import { Link, Outlet } from '@tanstack/react-router'

import { Button } from '@components/ui/button'
import { Card } from '@components/ui/card'
import { Input } from '@components/ui/input'
import { Separator } from '@components/ui/separator'

type ConversationItem = {
  id: string
  title: string
  lastMessage: string
  time: string
}

const mockConversations: ConversationItem[] = [
  { id: 'mock-1', title: '产品讨论（占位）', lastMessage: '明天对齐一下需求', time: '09:12' },
  { id: 'mock-2', title: '设计评审（占位）', lastMessage: '这个圆角再大一点', time: '昨天' },
  { id: 'mock-3', title: '随机闲聊（占位）', lastMessage: '哈哈哈哈', time: '周五' },
  { id: 'mock-4', title: '项目组（占位）', lastMessage: 'MVP 先跑起来', time: '12/20' },
]

const ChatsSidebar = React.memo(function ChatsSidebar() {
  return (
    <Card className="flex h-full min-h-0 w-80 shrink-0 flex-col overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">会话</div>
          <Button size="sm" variant="secondary" type="button">
            新建（占位）
          </Button>
        </div>
        <div className="mt-3">
          <Input placeholder="搜索会话…" />
        </div>
      </div>

      <Separator />

      <div className="min-h-0 flex-1 overflow-auto p-2">
        <div className="space-y-1">
          {mockConversations.map((c) => (
            <Button
              key={c.id}
              variant="ghost"
              className="h-auto w-full justify-start rounded-lg px-3 py-2"
              asChild
            >
              <Link
                to="/chats/$chatId"
                params={{ chatId: c.id }}
                activeProps={{
                  className:
                    "relative bg-accent/80 text-accent-foreground ring-1 ring-ring/20 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-1 before:rounded-full before:bg-primary before:content-['']",
                }}
                inactiveProps={{
                  className: 'hover:bg-accent/50',
                }}
              >
                <div className="flex w-full items-center gap-3">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-muted flex justify-center items-center border border-amber-300 text-amber-300">
                    Y
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="truncate text-sm font-medium">{c.title}</div>
                      <div className="shrink-0 text-xs text-muted-foreground">{c.time}</div>
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{c.lastMessage}</div>
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </Card>
  )
})

export function ChatsPage() {
  return (
    <div className="flex h-full min-h-0 gap-4 p-4">
      <ChatsSidebar />

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1">
          <Outlet />
        </div>
      </Card>
    </div>
  )
}


