import type { IAuthRepository } from '../repositories/auth.repository'
import type { LoginCredentials, RegisterData } from '../../domain/types'
import { User } from '../../domain/entities'
import { UserGenerator } from '@infra/mock/generators'

/**
 * Mock Auth Data Source
 * 模拟认证数据源，用于开发阶段
 */
export class MockAuthDataSource implements IAuthRepository {
  private currentUser: User | null = null

  async login(credentials: LoginCredentials): Promise<User> {
    // 模拟延迟
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 简单模拟登录
    if (credentials.username && credentials.password) {
      const mockUser = UserGenerator.generateOne()
      this.currentUser = User.fromTable({
        ...mockUser,
        username: credentials.username,
        status: 'online',
      })
      return this.currentUser
    }
    
    throw new Error('Invalid credentials')
  }

  async register(data: RegisterData): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const mockUser = UserGenerator.generateOne()
    this.currentUser = User.fromTable({
      ...mockUser,
      username: data.username,
      display_name: data.displayName,
      status: 'online',
    })
    return this.currentUser
  }

  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    this.currentUser = null
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser
  }
}

// 导出单例
export const mockAuthDataSource = new MockAuthDataSource()
