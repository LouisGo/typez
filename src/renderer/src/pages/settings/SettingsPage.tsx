import { Button } from '@components/ui/button'
import { Card } from '@components/ui/card'
import { Input } from '@components/ui/input'
import { Separator } from '@components/ui/separator'

export function SettingsPage() {
  return (
    <div className="h-full min-h-0 p-6">
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <div>
          <div className="text-lg font-semibold">设置</div>
          <div className="text-muted-foreground mt-1 text-sm">UI MVP 占位：仅基础布局</div>
        </div>

        <Card className="p-6">
          <div className="text-base font-semibold">账户</div>
          <div className="mt-2 grid gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">显示名称</div>
              <Input placeholder="例如：Louis" />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">状态签名</div>
              <Input placeholder="例如：保持专注" />
            </div>
            <div className="flex justify-end">
              <Button type="button">保存（占位）</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-base font-semibold">应用</div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">清理缓存</div>
              <div className="text-muted-foreground text-sm">仅 UI 占位，不会执行任何逻辑</div>
            </div>
            <Button variant="secondary" type="button">
              清理（占位）
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
