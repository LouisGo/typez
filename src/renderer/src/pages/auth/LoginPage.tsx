import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { Input } from '@components/ui/input'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@components/ui/form'
import { useLogin, loginSchema, type LoginFormValues } from '@infra/api'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@components/ui/field'
import { cn } from '@/shared/utils'
import { toast } from 'sonner'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { OTPForm } from '@/components/block/login-opt-form'

export function LoginPage() {
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false)

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
      toast.error(error instanceof Error ? error.message : 'Login failed')
    }
  }

  return (
    <div className={cn('w-1/2 max-w-md min-w-xs')}>
      {!isOTPModalOpen ? (
        <div className={cn('flex flex-col gap-6')}>
          <Card>
            <CardHeader className="relative">
              <CardTitle>登录</CardTitle>
              <CardDescription>输入你的邮箱登录</CardDescription>
              <div
                className={cn(
                  'text-sm text-muted-foreground',
                  'absolute top-6 right-4 cursor-pointer'
                )}
                onClick={() => setIsOTPModalOpen(true)}
              >
                验证码登录
              </div>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <FieldGroup>
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <Field>
                            <FieldLabel htmlFor={field.name}>用户名</FieldLabel>
                            <FormControl>
                              <Input
                                id={field.name}
                                type="text"
                                placeholder="输入你的用户名"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </Field>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <Field>
                            <div className="flex items-center">
                              <FieldLabel htmlFor={field.name}>密码</FieldLabel>
                              <a
                                href="#"
                                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                              >
                                忘记密码?
                              </a>
                            </div>
                            <FormControl>
                              <Input
                                id={field.name}
                                type="password"
                                placeholder="输入你的密码"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </Field>
                        </FormItem>
                      )}
                    />
                    <Field>
                      <Button type="submit" disabled={loginMutation.isPending}>
                        {loginMutation.isPending ? '登录中...' : '登录'}
                      </Button>
                      <Button variant="outline" type="button">
                        使用 Google 登录
                      </Button>
                      <FieldDescription className="text-center">
                        没有账号？<Link to="/auth/register">注册</Link>
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      ) : (
        <LoginOTPForm onClose={() => setIsOTPModalOpen(false)} />
      )}
    </div>
  )
}

interface LoginOTPFormProps {
  onClose?: () => void
}

function LoginOTPForm({ onClose }: LoginOTPFormProps) {
  return <OTPForm onClose={onClose}></OTPForm>
}
