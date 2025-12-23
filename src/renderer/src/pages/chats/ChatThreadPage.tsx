import { useParams } from '@tanstack/react-router'

import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import { Separator } from '@components/ui/separator'
import { Textarea } from '@components/ui/textarea'

export function ChatThreadPage() {
  const { chatId } = useParams({ from: '/app/chats/$chatId' })

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold">会话</div>
          <Badge variant="secondary" className="font-mono">
            {chatId}
          </Badge>
        </div>
        <Button variant="secondary" size="sm" type="button">
          详情（占位）
        </Button>
      </div>

      <Separator />

      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="space-y-3">
          <div className="bg-muted/10 text-muted-foreground rounded-xl border p-4 text-sm">
            （占位）消息列表区域：后续接入虚拟列表 / 分页 / 已读等逻辑
          </div>

          <div className="flex justify-start">
            <div className="bg-muted w-[min(520px,85%)] rounded-2xl p-3">
              <div className="bg-background/60 h-3 w-28 rounded" />
              <div className="bg-background/60 mt-2 h-3 w-64 rounded" />
            </div>
          </div>

          <div className="flex justify-end">
            <div className="bg-primary w-[min(520px,85%)] rounded-2xl p-3">
              <div className="bg-primary-foreground/70 h-3 w-20 rounded" />
              <div className="bg-primary-foreground/70 mt-2 h-3 w-56 rounded" />
            </div>
          </div>
        </div>
      </div>

      <Separator />
      <div className="p-3">
        <div className="flex gap-2">
          <Textarea className="min-h-10 resize-none" placeholder="输入消息…" rows={1} />
          <Button type="button">发送（占位）</Button>
        </div>
      </div>
    </div>
  )
}
