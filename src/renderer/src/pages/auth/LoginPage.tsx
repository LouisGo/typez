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

export function LoginPage() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">登录</CardTitle>
        <CardDescription>使用账号密码进入 Typez（UI MVP 占位）</CardDescription>
      </CardHeader>

      <Separator />

      <CardContent className="space-y-4 pt-5">
        <div className="space-y-2">
          <Label htmlFor="login-username">用户名</Label>
          <Input id="login-username" placeholder="请输入用户名" autoComplete="username" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-password">密码</Label>
          <Input
            id="login-password"
            type="password"
            placeholder="请输入密码"
            autoComplete="current-password"
          />
        </div>

        <Button className="w-full" type="button">
          登录（占位）
        </Button>
      </CardContent>

      <CardFooter className="justify-between gap-3">
        <div className="flex items-center justify-between text-sm">
          <Button variant="link" className="px-0" asChild>
            <Link to="/auth/register">去注册</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/chats">跳过登录进入应用</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
