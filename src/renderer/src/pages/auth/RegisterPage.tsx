import { Link } from '@tanstack/react-router'

import { Button } from '@components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@components/ui/card'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Separator } from '@components/ui/separator'

export function RegisterPage() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">注册</CardTitle>
        <CardDescription>创建新账号（UI MVP 占位）</CardDescription>
      </CardHeader>

      <Separator />

      <CardContent className="space-y-4 pt-5">
        <div className="space-y-2">
          <Label htmlFor="register-username">用户名</Label>
          <Input id="register-username" placeholder="例如：louis" autoComplete="username" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-displayName">显示名称</Label>
          <Input id="register-displayName" placeholder="例如：Louis" autoComplete="nickname" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-password">密码</Label>
          <Input
            id="register-password"
            type="password"
            placeholder="设置密码"
            autoComplete="new-password"
          />
        </div>

        <Button className="w-full" type="button">
          注册（占位）
        </Button>
      </CardContent>

      <CardFooter className="justify-between gap-3">
        <div className="flex items-center justify-between text-sm">
          <Button variant="link" className="px-0" asChild>
            <Link to="/auth/login">返回登录</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/chats">进入应用</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
