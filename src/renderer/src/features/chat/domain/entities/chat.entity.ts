import type { ChatTable, ChatType } from '@shared/types/database'

/**
 * Chat Domain Entity
 */
export class Chat {
  constructor(
    public readonly id: string,
    public type: ChatType,
    public title: string | null,
    public avatarUrl: string | null,
    public description: string | null,
    public memberCount: number,
    public lastMessageId: string | null,
    public lastMessageAt: number | null,
    public pinned: boolean,
    public muted: boolean,
    public createdAt: number,
    public updatedAt: number
  ) {}

  static fromTable(row: ChatTable): Chat {
    return new Chat(
      row.id,
      row.type,
      row.title,
      row.avatar_url,
      row.description,
      row.member_count,
      row.last_message_id,
      row.last_message_at,
      row.pinned,
      row.muted,
      row.created_at,
      row.updated_at
    )
  }

  isGroup(): boolean {
    return this.type === 'group'
  }

  isChannel(): boolean {
    return this.type === 'channel'
  }

  isPrivate(): boolean {
    return this.type === 'private'
  }

  getDisplayTitle(fallback: string = 'Unknown'): string {
    return this.title || fallback
  }
}
