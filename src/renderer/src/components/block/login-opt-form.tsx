import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { cn } from '@/shared/utils'

interface OTPFormProps {
  onClose?: () => void
}

export function OTPForm({ onClose, ...props }: OTPFormProps & React.ComponentProps<typeof Card>) {
  return (
    <Card {...props}>
      <CardHeader className="relative">
        <CardTitle>输入验证码</CardTitle>
        <CardDescription>我们发送了一个6位验证码到你的邮箱。</CardDescription>
        <div
          className={cn('text-sm text-muted-foreground', 'absolute top-6 right-4 cursor-pointer')}
          onClick={onClose}
        >
          密码登录
        </div>
      </CardHeader>
      <CardContent>
        <form>
          <FieldGroup>
            <Field>
              <InputOTP maxLength={6} id="otp" required>
                <InputOTPGroup className="flex w-full justify-center gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSeparator />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </Field>
            <FieldGroup>
              <Button type="submit">验证</Button>
              <FieldDescription className="text-center">
                没有收到验证码？<a href="#">重新发送</a>
              </FieldDescription>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
