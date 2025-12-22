import type { UserTable, UserStatus } from '@shared/types/database'

/**
 * User Domain Entity
 * 包含业务逻辑的用户实体
 */
export class User {
  constructor(
    public readonly id: string,
    public username: string,
    public displayName: string,
    public avatarUrl: string | null,
    public phone: string | null,
    public bio: string | null,
    public status: UserStatus,
    public lastSeen: number,
    public createdAt: number,
    public updatedAt: number
  ) {}

  /**
   * 从数据库记录创建实体
   */
  static fromTable(row: UserTable): User {
    return new User(
      row.id,
      row.username,
      row.display_name,
      row.avatar_url,
      row.phone,
      row.bio,
      row.status,
      row.last_seen,
      row.created_at,
      row.updated_at
    )
  }

  /**
   * 业务逻辑方法
   */
  isOnline(): boolean {
    return this.status === 'online'
  }

  getLastSeenText(): string {
    if (this.isOnline()) return 'online'
    const diff = Date.now() - this.lastSeen
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }
}
