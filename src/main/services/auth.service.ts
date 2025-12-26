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

    console.log('username', username)
    console.log('password', password)

    const result = this.db.query({
      table: 'users',
      where: { username }
    })

    console.log('result', result)

    if (result.rows.length === 0) {
      throw createAuthError.userNotFound()
    }

    const userTable = result.rows[0] as UserTable

    if (userTable.password !== password) {
      throw createAuthError.invalidPassword()
    }

    // 更新用户状态为在线
    this.db.update({
      table: 'users',
      data: { status: 'online', last_seen: Date.now(), updated_at: Date.now() },
      where: { id: userTable.id }
    })

    this.currentUserId = userTable.id as UserId

    // 为持久化会话，保存到 app_state (使用先删后插模拟 UPSERT)
    try {
      this.db.delete({ table: 'app_state', where: { key: 'current_user_id' } })
      this.db.insert({
        table: 'app_state',
        data: { key: 'current_user_id', value: this.currentUserId }
      })
    } catch (e) {
      console.error('[AuthService] Failed to persist session:', e)
    }

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
        avatar_url: null,
        phone: null,
        bio: null,
        status: 'online',
        kind: 'human',
        deleted_at: null,
        last_seen: now,
        created_at: now,
        updated_at: now
      }
    })

    this.currentUserId = userId
    // 为持久化会话，保存到 app_state
    try {
      this.db.delete({ table: 'app_state', where: { key: 'current_user_id' } })
      this.db.insert({
        table: 'app_state',
        data: { key: 'current_user_id', value: this.currentUserId }
      })
    } catch (e) {
      console.error('[AuthService] Failed to persist session during register:', e)
    }

    const user = await this.getCurrentUser(userId as UserId)
    return user!
  }

  async logout(userId: UserId): Promise<void> {
    this.db.update({
      table: 'users',
      data: { status: 'offline', last_seen: Date.now(), updated_at: Date.now() },
      where: { id: userId }
    })
    if (this.currentUserId === userId) {
      this.currentUserId = null
      this.db.delete({
        table: 'app_state',
        where: { key: 'current_user_id' }
      })
    }
  }

  async getCurrentUser(userId?: UserId): Promise<User | null> {
    let id = userId || this.currentUserId

    // 如果内存中没有且没有传入 ID，尝试从数据库恢复
    if (!id) {
      const result = this.db.query({
        table: 'app_state',
        where: { key: 'current_user_id' }
      })
      if (result.rows.length > 0) {
        id = (result.rows[0] as { value: string }).value as UserId
        this.currentUserId = id
      }
    }

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
