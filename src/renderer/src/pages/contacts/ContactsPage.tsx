import { Button } from '@components/ui/button'
import { Card } from '@components/ui/card'
import { Input } from '@components/ui/input'
import { Separator } from '@components/ui/separator'

export function ContactsPage() {
  return (
    <div className="flex h-full min-h-0">
      <aside className="w-80 shrink-0 border-r">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">联系人</div>
            <Button size="sm" variant="secondary" type="button">
              添加（占位）
            </Button>
          </div>
          <div className="mt-3">
            <Input placeholder="搜索联系人…" />
          </div>
        </div>
        <Separator />
        <div className="text-muted-foreground p-4 text-sm">（占位）联系人列表</div>
      </aside>

      <main className="min-w-0 flex-1 p-6">
        <Card className="p-6">
          <div className="text-base font-semibold">联系人详情</div>
          <div className="text-muted-foreground mt-2 text-sm">
            这里后续展示资料卡、备注、共同群组等（UI MVP 占位）。
          </div>
        </Card>
      </main>
    </div>
  )
}
