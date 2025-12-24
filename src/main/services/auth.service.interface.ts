import type { User, UserId } from '@sdk/contract/models'

/**
 * 认证服务接口
 * 返回 camelCase 格式的领域模型
 */
export interface IAuthService {
  login(username: string, password: string): Promise<User>
  register(username: string, displayName: string, password: string): Promise<User>
  logout(userId: UserId): Promise<void>
  getCurrentUser(userId?: UserId): Promise<User | null>
}
