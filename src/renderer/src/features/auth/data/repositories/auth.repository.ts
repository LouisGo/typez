import type { User } from '../domain/entities'
import type { LoginCredentials, RegisterData } from '../domain/types'

/**
 * Auth Repository Interface
 * 定义认证数据访问的抽象接口
 */
export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<User>
  register(data: RegisterData): Promise<User>
  logout(): Promise<void>
  getCurrentUser(): Promise<User | null>
}
