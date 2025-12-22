import { ipcMain } from 'electron'
import { authService } from '../services'

/**
 * 认证 IPC Handlers
 * 处理渲染进程的认证请求
 */
export function setupAuthHandlers(): void {
  // 登录
  ipcMain.handle('auth:login', async (_, { username, password }) => {
    try {
      console.log('[IPC] auth:login', { username })
      return await authService.login(username, password)
    } catch (error: any) {
      console.error('[IPC] auth:login error:', error)
      throw error
    }
  })

  // 注册
  ipcMain.handle('auth:register', async (_, { username, displayName, password }) => {
    try {
      console.log('[IPC] auth:register', { username, displayName })
      return await authService.register(username, displayName, password)
    } catch (error: any) {
      console.error('[IPC] auth:register error:', error)
      throw error
    }
  })

  // 登出
  ipcMain.handle('auth:logout', async (_, { userId }) => {
    try {
      console.log('[IPC] auth:logout', { userId })
      await authService.logout(userId)
    } catch (error: any) {
      console.error('[IPC] auth:logout error:', error)
      throw error
    }
  })

  // 获取当前用户
  ipcMain.handle('auth:getCurrentUser', async (_, { userId }) => {
    try {
      console.log('[IPC] auth:getCurrentUser', { userId })
      return await authService.getCurrentUser(userId)
    } catch (error: any) {
      console.error('[IPC] auth:getCurrentUser error:', error)
      throw error
    }
  })
}
