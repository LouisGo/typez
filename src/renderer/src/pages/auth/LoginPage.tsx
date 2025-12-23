import { Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Separator } from '@components/ui/separator'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@components/ui/form'
import { useLogin, loginSchema, type LoginFormValues } from '@infra/api'
import { FieldGroup } from '@components/ui/field'

export function LoginPage() {
  const loginMutation = useLogin()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync(values)
    } catch (error) {
      // 错误已在 mutation 中处理
      console.error('Login failed:', error)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">登录</CardTitle>
        <CardDescription>使用账号密码进入 Typez</CardDescription>
      </CardHeader>

      <Separator />

      <CardContent className="space-y-4 pt-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {loginMutation.isError && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {loginMutation.error instanceof Error
                  ? loginMutation.error.message
                  : '登录失败，请检查用户名和密码'}
              </div>
            )}

            <FieldGroup>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>用户名</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="请输入用户名"
                        autoComplete="username"
                        disabled={loginMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FieldGroup>

            <FieldGroup>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密码</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="请输入密码"
                        autoComplete="current-password"
                        disabled={loginMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FieldGroup>
            <Button className="w-full" type="submit" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? '登录中...' : '登录'}
            </Button>
          </form>
        </Form>
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
