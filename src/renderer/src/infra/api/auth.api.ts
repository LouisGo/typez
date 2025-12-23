import { apiClient } from './client'

/**
 * 认证 API
 * 封装所有认证相关的 IPC 调用
 * 所有类型自动从 IPCChannels 推导，返回 camelCase 格式的领域模型
 */
export const authAPI = {
  /**
   * 用户登录
   * @param username - 用户名
   * @param password - 密码
   * @returns Promise<User> - 用户信息（camelCase）
   */
  login: (username: string, password: string) => {
    return apiClient.invoke('auth:login', { username, password })
  },

  /**
   * 用户注册
   * @param username - 用户名
   * @param displayName - 显示名称
   * @param password - 密码
   * @returns Promise<User> - 用户信息（camelCase）
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
   * @returns Promise<User | null> - 用户信息或 null（camelCase）
   */
  getCurrentUser: (userId: string) => {
    return apiClient.invoke('auth:getCurrentUser', { userId })
  }
}
