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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@components/ui/form'
import { useRegister, registerSchema, type RegisterFormValues } from '@infra/api'

export function RegisterPage() {
  const registerMutation = useRegister()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      displayName: '',
      password: '',
      confirmPassword: ''
    }
  })

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await registerMutation.mutateAsync(values)
    } catch (error) {
      // 错误已在 mutation 中处理
      console.error('Register failed:', error)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">注册</CardTitle>
        <CardDescription>创建新账号，开始使用 Typez</CardDescription>
      </CardHeader>

      <Separator />

      <CardContent className="space-y-4 pt-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {registerMutation.isError && (
              <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
                {registerMutation.error instanceof Error
                  ? registerMutation.error.message
                  : '注册失败，请检查输入信息'}
              </div>
            )}

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>用户名</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="例如：louis（3-20个字符，字母、数字、下划线）"
                      autoComplete="username"
                      disabled={registerMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    用户名至少需要 3 个字符，只能包含字母、数字和下划线
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>显示名称</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="例如：Louis"
                      autoComplete="nickname"
                      disabled={registerMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>密码</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="设置密码（至少 6 个字符）"
                      autoComplete="new-password"
                      disabled={registerMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>密码至少需要 6 个字符</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>确认密码</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="请再次输入密码"
                      autoComplete="new-password"
                      disabled={registerMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-full" type="submit" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? '注册中...' : '注册'}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="justify-between gap-3">
        <div className="flex w-full items-center justify-between text-sm">
          <Button variant="link" className="px-0" asChild>
            <Link to="/auth/login">已有账号？去登录</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
