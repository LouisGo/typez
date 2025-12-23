import { Link } from '@tanstack/react-router'

import { Button } from '@components/ui/button'
import { Card } from '@components/ui/card'
import { Input } from '@components/ui/input'
import { Separator } from '@components/ui/separator'

export function RegisterPage() {
  return (
    <Card className="p-6">
      <div className="space-y-1">
        <div className="text-xl font-semibold">注册</div>
        <div className="text-muted-foreground text-sm">创建新账号（UI MVP 占位）</div>
      </div>

      <Separator className="my-5" />

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">用户名</div>
          <Input placeholder="例如：louis" />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">显示名称</div>
          <Input placeholder="例如：Louis" />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">密码</div>
          <Input type="password" placeholder="设置密码" />
        </div>

        <Button className="w-full" type="button">
          注册（占位）
        </Button>

        <div className="flex items-center justify-between text-sm">
          <Button variant="link" className="px-0" asChild>
            <Link to="/auth/login">返回登录</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/chats">进入应用</Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}
