import { Link } from '@tanstack/react-router'

import { Button } from '@components/ui/button'
import { Card } from '@components/ui/card'
import { Input } from '@components/ui/input'
import { Separator } from '@components/ui/separator'

export function LoginPage() {
  return (
    <Card className="p-6">
      <div className="space-y-1">
        <div className="text-xl font-semibold">登录</div>
        <div className="text-sm text-muted-foreground">使用账号密码进入 Typez（UI MVP 占位）</div>
      </div>

      <Separator className="my-5" />

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">用户名</div>
          <Input placeholder="请输入用户名" />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">密码</div>
          <Input type="password" placeholder="请输入密码" />
        </div>

        <Button className="w-full" type="button">
          登录（占位）
        </Button>

        <div className="flex items-center justify-between text-sm">
          <Button variant="link" className="px-0" asChild>
            <Link to="/auth/register">去注册</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/chats">跳过登录进入应用</Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}


