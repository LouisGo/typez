import React from 'react'
import { useParams } from '@tanstack/react-router'

import { Button } from '@renderer/shared/ui/button'
import { Input } from '@renderer/shared/ui/input'

export function ChatThreadPage() {
  const { chatId } = useParams({ from: '/chats/$chatId' })

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="text-sm font-semibold">Chat: {chatId}</div>
        <Button
          variant="ghost"
          onClick={() => window.electron?.ipcRenderer?.send?.('ping')}
          title="验证 IPC 通道仍然可用"
        >
          Ping IPC
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="space-y-2">
          <div className="rounded-md border p-3 text-sm">（占位）消息列表区域</div>
          <div className="rounded-md border p-3 text-sm">后续接入虚拟列表 + 分页加载</div>
        </div>
      </div>

      <div className="border-t p-3">
        <div className="flex gap-2">
          <Input placeholder="输入消息…" />
          <Button>发送</Button>
        </div>
      </div>
    </div>
  )
}


