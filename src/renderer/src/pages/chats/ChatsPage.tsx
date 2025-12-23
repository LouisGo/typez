import React from 'react'
import { Outlet } from '@tanstack/react-router'

import { Button } from '@components/ui/button'
import { Card, CardContent, CardHeader } from '@components/ui/card'
import { Input } from '@components/ui/input'
import { Separator } from '@components/ui/separator'
import { ConversationListItem } from '@components/business/conversation'

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
  { id: 'mock-4', title: '项目组（占位）', lastMessage: 'MVP 先跑起来', time: '12/20' }
]

const ChatsSidebar = React.memo(function ChatsSidebar() {
  return (
    <Card className="flex h-full min-h-0 w-80 shrink-0 flex-col overflow-hidden">
      <CardHeader className="p-4 pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">会话</div>
          <Button size="sm" variant="secondary" type="button">
            新建（占位）
          </Button>
        </div>
        <div className="pt-3">
          <Input placeholder="搜索会话…" />
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="min-h-0 flex-1 overflow-auto p-2">
        <div className="space-y-1">
          {mockConversations.map((c) => (
            <ConversationListItem
              key={c.id}
              conversation={{
                id: c.id,
                title: c.title,
                lastMessage: c.lastMessage,
                time: c.time,
                avatarFallback: 'Y'
              }}
              to="/chats/$chatId"
              params={{ chatId: c.id }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
})

export function ChatsPage(): React.ReactElement {
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
