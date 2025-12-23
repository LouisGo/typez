import { apiClient } from './client'

/**
 * 认证 API
 * 封装所有认证相关的 IPC 调用
 * 所有类型自动从 IPCChannels 推导，无需手动指定
 */
export const authAPI = {
  /**
   * 用户登录
   * @param username - 用户名
   * @param password - 密码
   * @returns Promise<UserTable> - 用户信息
   */
  login: (username: string, password: string) => {
    return apiClient.invoke('auth:login', { username, password })
  },

  /**
   * 用户注册
   * @param username - 用户名
   * @param displayName - 显示名称
   * @param password - 密码
   * @returns Promise<UserTable> - 用户信息
   */
  register: (username: string, displayName: string, password: string) => {
    return apiClient.invoke('auth:register', { username, displayName, password })
  },

  /**
   * 用户登出
   * @param userId - 用户 ID
   * @returns Promise<void>
   */
  logout: (userId: string) => {
    return apiClient.invoke('auth:logout', { userId })
  },

  /**
   * 获取当前用户
   * @param userId - 用户 ID
   * @returns Promise<UserTable | null> - 用户信息或 null
   */
  getCurrentUser: (userId: string) => {
    return apiClient.invoke('auth:getCurrentUser', { userId })
  }
}
