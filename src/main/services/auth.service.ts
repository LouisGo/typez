import { DatabaseService } from '../database'
import type { IAuthService } from './auth.service.interface'
import type { UserTable } from '../database/types'
import type { User, UserId } from '@sdk/contract/models'
import { createAuthError } from '@sdk/auth/errors'
import { userTableToUser } from '../utils/transformers'

/**
 * 用户名验证规则
 */
function validateUsername(username: string): void {
  if (!username || username.trim().length === 0) {
    throw createAuthError.invalidUsername('用户名不能为空')
  }
  if (username.length < 3) {
    throw createAuthError.invalidUsername('用户名至少需要 3 个字符')
  }
  if (username.length > 20) {
    throw createAuthError.invalidUsername('用户名不能超过 20 个字符')
  }
  // 只允许字母、数字、下划线
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    throw createAuthError.invalidUsername('用户名只能包含字母、数字和下划线')
  }
}

/**
 * 密码验证规则
 */
function validatePassword(password: string): void {
  if (!password || password.length === 0) {
    throw createAuthError.invalidPasswordFormat('密码不能为空')
  }
  if (password.length < 6) {
    throw createAuthError.invalidPasswordFormat('密码至少需要 6 个字符')
  }
  if (password.length > 100) {
    throw createAuthError.invalidPasswordFormat('密码不能超过 100 个字符')
  }
}

/**
 * 显示名称验证规则
 */
function validateDisplayName(displayName: string): void {
  if (!displayName || displayName.trim().length === 0) {
    throw createAuthError.invalidDisplayName('显示名称不能为空')
  }
  if (displayName.length > 50) {
    throw createAuthError.invalidDisplayName('显示名称不能超过 50 个字符')
  }
}

/**
 * 真实认证服务
 * 用于生产环境的数据库实现
 * 负责数据转换：snake_case (数据库) → camelCase (领域模型)
 */
export class AuthService implements IAuthService {
  private currentUserId: UserId | null = null

  constructor(private db: DatabaseService) {}

  async login(username: string, password: string): Promise<User> {
    // ... (输入验证逻辑保持不变)
    validateUsername(username)
    validatePassword(password)

    const result = this.db.query({
      table: 'users',
      where: { username }
    })

    if (result.rows.length === 0) {
      throw createAuthError.userNotFound()
    }

    const userTable = result.rows[0] as UserTable

    if (userTable.password !== password) {
      throw createAuthError.invalidPassword()
    }

    this.db.update({
      table: 'users',
      data: { status: 'online', last_seen: Date.now() },
      where: { id: userTable.id }
    })

    this.currentUserId = userTable.id as UserId
    return userTableToUser(userTable)
  }

  async register(username: string, displayName: string, password: string): Promise<User> {
    // ... (逻辑保持不变，最后会调用 getCurrentUser)
    validateUsername(username)
    validatePassword(password)
    validateDisplayName(displayName)

    const existingResult = this.db.query({
      table: 'users',
      where: { username }
    })

    if (existingResult.rows.length > 0) {
      throw createAuthError.usernameAlreadyExists()
    }

    const now = Date.now()
    const userId = crypto.randomUUID() as UserId

    this.db.insert({
      table: 'users',
      data: {
        id: userId,
        username: username.trim(),
        display_name: displayName.trim(),
        password,
        avatar_url: '',
        phone: '',
        bio: '',
        status: 'online',
        last_seen: now,
        created_at: now,
        updated_at: now
      }
    })

    this.currentUserId = userId
    const user = await this.getCurrentUser(userId as UserId)
    return user!
  }

  async logout(userId: UserId): Promise<void> {
    this.db.update({
      table: 'users',
      data: { status: 'offline', last_seen: Date.now() },
      where: { id: userId }
    })
    if (this.currentUserId === userId) {
      this.currentUserId = null
    }
  }

  async getCurrentUser(userId?: UserId): Promise<User | null> {
    const id = userId || this.currentUserId
    if (!id) return null

    const result = this.db.query({
      table: 'users',
      where: { id }
    })

    if (result.rows.length === 0) {
      return null
    }

    const userTable = result.rows[0] as UserTable
    return userTableToUser(userTable)
  }
}
