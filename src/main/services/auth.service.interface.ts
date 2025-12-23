import type { UserTable } from '@shared/types/database'

/**
 * 认证服务接口
 */
export interface IAuthService {
  login(username: string, password: string): Promise<UserTable>
  register(username: string, displayName: string, password: string): Promise<UserTable>
  logout(userId: string): Promise<void>
  getCurrentUser(userId: string): Promise<UserTable | null>
}
