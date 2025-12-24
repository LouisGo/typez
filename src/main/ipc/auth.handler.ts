import { authService } from '../services'
import { createHandler } from './utils'

/**
 * 认证 IPC Handlers
 * 处理渲染进程的认证请求
 */
export function setupAuthHandlers(): void {
  // 登录
  createHandler('auth:login', async (params) => {
    return await authService.login(params.username, params.password)
  })

  // 注册
  createHandler('auth:register', async (params) => {
    return await authService.register(params.username, params.displayName, params.password)
  })

  // 登出
  createHandler('auth:logout', async (params) => {
    await authService.logout(params.userId)
  })

  // 获取当前用户
  createHandler('auth:me', async () => {
    return await authService.getCurrentUser()
  })
}
