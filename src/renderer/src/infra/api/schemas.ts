import { z } from 'zod'

export const usernameSchema = z
  .string()
  .min(1, '用户名不能为空')
  .min(3, '用户名至少需要 3 个字符')
  .max(20, '用户名不能超过 20 个字符')
  .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线')

export const passwordSchema = z.string().min(1, '密码不能为空').min(6, '密码至少需要 6 个字符')

/**
 * 登录表单验证 Schema
 */
export const loginSchema = z.object({
  username: usernameSchema,
  password: passwordSchema
})

/**
 * 注册表单验证 Schema
 */
export const registerSchema = z
  .object({
    username: usernameSchema,
    password: passwordSchema,
    displayName: z.string().min(1, '显示名称不能为空'),
    confirmPassword: z.string().min(1, '请确认密码')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword']
  })
