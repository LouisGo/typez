import { apiClient } from './client'
import type { UserTable } from '@shared/types/database'

/**
 * 认证 API
 * 封装所有认证相关的 IPC 调用
 */
export const authAPI = {
  /**
   * 用户登录
   */
  login: (username: string, password: string): Promise<UserTable> => {
    return apiClient.invoke<UserTable>('auth:login', { username, password })
  },

  /**
   * 用户注册
   */
  register: (username: string, displayName: string, password: string): Promise<UserTable> => {
    return apiClient.invoke<UserTable>('auth:register', { username, displayName, password })
  },

  /**
   * 用户登出
   */
  logout: (userId: string): Promise<void> => {
    return apiClient.invoke<void>('auth:logout', { userId })
  },

  /**
   * 获取当前用户
   */
  getCurrentUser: (userId: string): Promise<UserTable | null> => {
    return apiClient.invoke<UserTable | null>('auth:getCurrentUser', { userId })
  }
}


