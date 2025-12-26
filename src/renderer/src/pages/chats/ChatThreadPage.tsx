import { useParams } from '@tanstack/react-router'

import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import { Separator } from '@components/ui/separator'
import { Textarea } from '@components/ui/textarea'
import { RippleButton } from '@/components/ui/ripple-button'
import { RingButton } from '@/components/ui/ring-button'

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
          <div className="rounded-xl border bg-muted/10 p-4 text-sm text-muted-foreground">
            （占位）消息列表区域：后续接入虚拟列表 / 分页 / 已读等逻辑
          </div>

          <div className="flex justify-start">
            <div className="w-[min(520px,85%)] rounded-2xl bg-muted p-3">
              <div className="h-3 w-28 rounded bg-background/60" />
              <div className="mt-2 h-3 w-64 rounded bg-background/60" />
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-[min(520px,85%)] rounded-2xl bg-primary p-3">
              <div className="h-3 w-20 rounded bg-primary-foreground/70" />
              <div className="mt-2 h-3 w-56 rounded bg-primary-foreground/70" />
            </div>
          </div>
        </div>
      </div>

      <Separator />
      <div className="p-3">
        <div className="flex gap-2">
          <Textarea className="min-h-10 resize-none" placeholder="输入消息…" rows={1} />
          <RingButton type="button">发送（占位）</RingButton>
        </div>
      </div>
    </div>
  )
}
