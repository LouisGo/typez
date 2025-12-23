import { z } from 'zod'
import { loginSchema, registerSchema } from './schemas'

/**
 * 登录表单类型
 * 从 zod schema 自动推断
 */
export type LoginFormValues = z.infer<typeof loginSchema>

/**
 * 注册表单类型
 * 从 zod schema 自动推断
 */
export type RegisterFormValues = z.infer<typeof registerSchema>
