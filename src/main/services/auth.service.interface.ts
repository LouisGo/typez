import type { User } from '@sdk/types/models'

/**
 * 认证服务接口
 * 返回 camelCase 格式的领域模型
 */
export interface IAuthService {
  login(username: string, password: string): Promise<User>
  register(username: string, displayName: string, password: string): Promise<User>
  logout(userId: string): Promise<void>
  getCurrentUser(userId?: string): Promise<User | null>
}
