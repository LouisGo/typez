import type { IAuthService } from '../../services/auth.service.interface'
import type { UserTable } from '@shared/types/database'
import { UserGenerator } from '../generators'

/**
 * Mock 认证服务
 * 用于开发环境的模拟实现
 */
export class MockAuthService implements IAuthService {
  private users: Map<string, UserTable> = new Map()

  constructor() {
    // 预生成一些测试用户
    const testUsers = UserGenerator.generate(10)
    testUsers.forEach(user => this.users.set(user.id, user))
  }

  async login(username: string, _password: string): Promise<UserTable> {
    // 模拟网络延迟
    await this.delay(500)

    // 检查是否已有该用户名
    const existingUser = Array.from(this.users.values()).find(
      u => u.username === username
    )

    if (existingUser) {
      existingUser.status = 'online'
      existingUser.last_seen = Date.now()
      return existingUser
    }

    // 创建新用户 (Mock 模式下自动注册)
    const newUser = UserGenerator.generateOne()
    newUser.username = username
    newUser.status = 'online'
    
    this.users.set(newUser.id, newUser)

    return newUser
  }

  async register(username: string, displayName: string, _password: string): Promise<UserTable> {
    await this.delay(500)

    const user = UserGenerator.generateOne()
    user.username = username
    user.display_name = displayName
    user.status = 'online'

    this.users.set(user.id, user)

    return user
  }

  async logout(userId: string): Promise<void> {
    await this.delay(300)

    const user = this.users.get(userId)
    if (user) {
      user.status = 'offline'
      user.last_seen = Date.now()
    }
  }

  async getCurrentUser(userId: string): Promise<UserTable | null> {
    return this.users.get(userId) || null
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

