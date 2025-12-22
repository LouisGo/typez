import { DatabaseService } from '../database'
import type { IAuthService } from './auth.service.interface'
import type { UserTable } from '@shared/types/database'

/**
 * 真实认证服务
 * 用于生产环境的数据库实现
 */
export class AuthService implements IAuthService {
  constructor(private db: DatabaseService) {}

  async login(username: string, _password: string): Promise<UserTable> {
    // 查询数据库
    const result = await this.db.query({
      table: 'users',
      where: { username }
    })

    if (result.rows.length === 0) {
      throw new Error('用户不存在')
    }

    const user = result.rows[0] as UserTable

    // TODO: 验证密码 (使用 bcrypt)
    // if (!bcrypt.compareSync(_password, user.password_hash)) {
    //   throw new Error('密码错误')
    // }

    // 更新登录状态
    await this.db.update({
      table: 'users',
      data: { status: 'online', last_seen: Date.now() },
      where: { id: user.id }
    })

    return user
  }

  async register(username: string, displayName: string, _password: string): Promise<UserTable> {
    // TODO: 密码加密
    // const passwordHash = bcrypt.hashSync(_password, 10)

    const now = Date.now()
    const userId = crypto.randomUUID()
    
    await this.db.insert({
      table: 'users',
      data: {
        id: userId,
        username,
        display_name: displayName,
        // password_hash: passwordHash,
        avatar_url: '',
        phone: '',
        bio: '',
        status: 'online',
        last_seen: now,
        created_at: now,
        updated_at: now
      }
    })

    const user = await this.getCurrentUser(userId)
    if (!user) {
      throw new Error('创建用户失败')
    }

    return user
  }

  async logout(userId: string): Promise<void> {
    await this.db.update({
      table: 'users',
      data: { status: 'offline', last_seen: Date.now() },
      where: { id: userId }
    })
  }

  async getCurrentUser(userId: string): Promise<UserTable | null> {
    const result = await this.db.query({
      table: 'users',
      where: { id: userId }
    })

    return result.rows.length > 0 ? (result.rows[0] as UserTable) : null
  }
}

