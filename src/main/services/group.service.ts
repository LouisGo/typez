import type { DatabaseService } from '../database'
import type { IAuthService } from './auth.service.interface'
import type { IGroupService } from './group.service.interface'
import type { Chat, ChatId, ChatType, MemberRole, UserId } from '@sdk/contract/models'
import type { ChatTable } from '../database/types'
import { chatTableToChat } from '../utils/transformers'
import { createAuthError } from '@sdk/auth/errors'

type ChatMemberRow = {
  id: string
  chat_id: string
  user_id: string
  role: MemberRole
  joined_at: number
  left_at: number | null
}

export class GroupService implements IGroupService {
  constructor(
    private db: DatabaseService,
    private auth: IAuthService
  ) {}

  private async requireMe(): Promise<UserId> {
    const me = await this.auth.getCurrentUser()
    if (!me) throw createAuthError.notLoggedIn()
    return me.id
  }

  async create(input: { title: string; memberIds: UserId[]; description?: string }): Promise<Chat> {
    const meId = await this.requireMe()
    const now = Date.now()
    const chatId = crypto.randomUUID() as ChatId
    const members = Array.from(new Set([meId, ...input.memberIds]))

    return this.db.transaction(() => {
      this.db.rawRun(
        `INSERT INTO chats
          (id, type, title, avatar_url, description, member_count, last_message_id, last_message_at, pinned, muted, created_by, metadata, deleted_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          chatId,
          'group' satisfies ChatType,
          input.title,
          null,
          input.description ?? null,
          members.length,
          null,
          null,
          0,
          0,
          meId,
          null,
          null,
          now,
          now
        ]
      )

      for (const uid of members) {
        const role: MemberRole = uid === meId ? 'owner' : 'member'
        const row: ChatMemberRow = {
          id: crypto.randomUUID(),
          chat_id: chatId,
          user_id: uid,
          role,
          joined_at: now,
          left_at: null
        }
        // UNIQUE(chat_id,user_id) 可能冲突，直接忽略
        try {
          this.db.rawRun(
            `INSERT INTO chat_members (id, chat_id, user_id, role, joined_at, left_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [row.id, row.chat_id, row.user_id, row.role, row.joined_at, row.left_at]
          )
        } catch {
          // ignore
        }
      }

      // 为创建者初始化 chat_user_settings（未读=0）
      const settingsId = crypto.randomUUID()
      try {
        this.db.rawRun(
          `INSERT INTO chat_user_settings
            (id, user_id, chat_id, pinned, muted, archived, last_read_message_id, last_read_at, unread_count, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [settingsId, meId, chatId, 0, 0, 0, null, null, 0, now]
        )
      } catch {
        // ignore
      }

      const chat = this.db.rawGet<ChatTable>('SELECT * FROM chats WHERE id = ?', [chatId])
      if (!chat) throw new Error('创建群聊失败')
      return chatTableToChat(chat)
    })
  }

  async addMembers(chatId: ChatId, memberIds: UserId[]): Promise<void> {
    const meId = await this.requireMe()
    const now = Date.now()
    const members = Array.from(new Set(memberIds))
    if (members.length === 0) return

    // 要求操作者是群成员（最小校验）
    const meMembership = this.db.rawGet<{ id: string }>(
      'SELECT id FROM chat_members WHERE chat_id = ? AND user_id = ?',
      [chatId, meId]
    )
    if (!meMembership) throw new Error('无权操作：你不是该群成员')

    this.db.transaction(() => {
      for (const uid of members) {
        try {
          this.db.rawRun(
            `INSERT INTO chat_members (id, chat_id, user_id, role, joined_at, left_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [crypto.randomUUID(), chatId, uid, 'member', now, null]
          )
        } catch {
          // ignore duplicates
        }
      }

      // member_count 以实际成员数为准（避免累计误差）
      const cnt = this.db.rawGet<{ c: number }>(
        'SELECT COUNT(1) as c FROM chat_members WHERE chat_id = ?',
        [chatId]
      )
      this.db.rawRun('UPDATE chats SET member_count = ?, updated_at = ? WHERE id = ?', [
        cnt?.c ?? 1,
        now,
        chatId
      ])
    })
  }

  async updateProfile(
    chatId: ChatId,
    input: { title?: string; avatarUrl?: string | null; description?: string | null }
  ): Promise<Chat> {
    const meId = await this.requireMe()
    const now = Date.now()

    // 要求操作者是群成员（最小校验）
    const meMembership = this.db.rawGet<{ id: string }>(
      'SELECT id FROM chat_members WHERE chat_id = ? AND user_id = ?',
      [chatId, meId]
    )
    if (!meMembership) throw new Error('无权操作：你不是该群成员')

    const patches: string[] = []
    const params: unknown[] = []
    if (input.title !== undefined) {
      patches.push('title = ?')
      params.push(input.title)
    }
    if (input.avatarUrl !== undefined) {
      patches.push('avatar_url = ?')
      params.push(input.avatarUrl)
    }
    if (input.description !== undefined) {
      patches.push('description = ?')
      params.push(input.description)
    }

    patches.push('updated_at = ?')
    params.push(now)
    params.push(chatId)

    this.db.rawRun(`UPDATE chats SET ${patches.join(', ')} WHERE id = ?`, params)

    const chat = this.db.rawGet<ChatTable>('SELECT * FROM chats WHERE id = ?', [chatId])
    if (!chat) throw new Error('群聊不存在')
    return chatTableToChat(chat)
  }
}
