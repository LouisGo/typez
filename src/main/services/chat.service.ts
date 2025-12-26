import type { DatabaseService } from '../database'
import type { IChatService } from './chat.service.interface'
import type { ChatTable, MessageTable } from '../database/types'
import type {
  Chat,
  Message,
  ChatId,
  ChatUserSettings,
  MessageId,
  UserId
} from '@sdk/contract/models'
import { chatTableToChat, messageTableToMessage } from '../utils/transformers'
import type { IAuthService } from './auth.service.interface'
import { createAuthError } from '@sdk/auth/errors'
import type { Id } from '@sdk/core/branded'

type ChatUserSettingsRow = {
  id: string
  user_id: string
  chat_id: string
  pinned: number
  muted: number
  archived: number
  last_read_message_id: string | null
  last_read_at: number | null
  unread_count: number
  updated_at: number
}

function settingsRowToModel(row: ChatUserSettingsRow): ChatUserSettings {
  return {
    id: row.id as Id<'chat_user_settings'>,
    userId: row.user_id as UserId,
    chatId: row.chat_id as ChatId,
    pinned: Boolean(row.pinned),
    muted: Boolean(row.muted),
    archived: Boolean(row.archived),
    lastReadMessageId: (row.last_read_message_id as MessageId | null) ?? null,
    lastReadAt: row.last_read_at,
    unreadCount: row.unread_count,
    updatedAt: row.updated_at
  }
}

/**
 * 真实聊天服务 (SQLite 实现)
 * 负责数据转换：snake_case (数据库) → camelCase (领域模型)
 */
export class ChatService implements IChatService {
  constructor(
    private db: DatabaseService,
    private auth: IAuthService
  ) {}

  private async requireMe(): Promise<UserId> {
    const me = await this.auth.getCurrentUser()
    if (!me) throw createAuthError.notLoggedIn()
    return me.id
  }

  private ensureSettingsRow(input: {
    userId: UserId
    chatId: ChatId
    now: number
    unreadCount?: number
  }): void {
    const existing = this.db.rawGet<ChatUserSettingsRow>(
      'SELECT * FROM chat_user_settings WHERE user_id = ? AND chat_id = ?',
      [input.userId, input.chatId]
    )
    if (existing) return
    this.db.rawRun(
      `INSERT INTO chat_user_settings
        (id, user_id, chat_id, pinned, muted, archived, last_read_message_id, last_read_at, unread_count, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        crypto.randomUUID(),
        input.userId,
        input.chatId,
        0,
        0,
        0,
        null,
        null,
        input.unreadCount ?? 0,
        input.now
      ]
    )
  }

  async getChats(): Promise<Chat[]> {
    const meId = await this.requireMe()
    const chatTables = this.db.rawAll<ChatTable>(
      `
      SELECT c.*
      FROM chats c
      JOIN chat_members m ON m.chat_id = c.id
      WHERE m.user_id = ?
      ORDER BY c.last_message_at DESC, c.updated_at DESC
      `,
      [meId]
    )
    return chatTables.map(chatTableToChat)
  }

  async getChatById(id: ChatId): Promise<Chat | null> {
    const meId = await this.requireMe()
    const chatTable = this.db.rawGet<ChatTable>(
      `
      SELECT c.*
      FROM chats c
      JOIN chat_members m ON m.chat_id = c.id
      WHERE c.id = ? AND m.user_id = ?
      LIMIT 1
      `,
      [id, meId]
    )
    return chatTable ? chatTableToChat(chatTable) : null
  }

  async getMessages(chatId: ChatId, limit: number = 50, offset: number = 0): Promise<Message[]> {
    const meId = await this.requireMe()
    // 仅允许群成员拉消息
    const membership = this.db.rawGet<{ id: string }>(
      'SELECT id FROM chat_members WHERE chat_id = ? AND user_id = ?',
      [chatId, meId]
    )
    if (!membership) return []

    const messageTables = this.db.rawAll<MessageTable>(
      `
      SELECT *
      FROM messages
      WHERE chat_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
      `,
      [chatId, limit, offset]
    )
    return messageTables.map(messageTableToMessage)
  }

  async sendMessage(chatId: ChatId, content: string): Promise<Message> {
    const meId = await this.requireMe()
    const now = Date.now()
    const messageId = crypto.randomUUID()
    const clientId = crypto.randomUUID()

    // 仅允许群成员发送
    const membership = this.db.rawGet<{ id: string }>(
      'SELECT id FROM chat_members WHERE chat_id = ? AND user_id = ?',
      [chatId, meId]
    )
    if (!membership) throw new Error('无权发送：你不是该会话成员')

    this.db.transaction(() => {
      this.db.insert({
        table: 'messages',
        data: {
          id: messageId,
          chat_id: chatId,
          sender_id: meId,
          content,
          type: 'text',
          reply_to_id: null,
          forwarded_from_id: null,
          client_id: clientId,
          status: 'sent',
          created_at: now,
          updated_at: now,
          read: 0,
          edited: 0,
          edited_at: null,
          deleted_at: null
        }
      })

      // 更新聊天的最后一条消息
      this.db.update({
        table: 'chats',
        data: {
          last_message_id: messageId,
          last_message_at: now,
          updated_at: now
        },
        where: { id: chatId }
      })

      // 更新 unread_count（最小实现：成员 +1，发送者清零）
      const members = this.db.rawAll<{ user_id: string }>(
        'SELECT user_id FROM chat_members WHERE chat_id = ?',
        [chatId]
      )
      for (const m of members) {
        const uid = m.user_id as UserId
        if (uid === meId) {
          this.ensureSettingsRow({ userId: uid, chatId, now, unreadCount: 0 })
          this.db.rawRun(
            `UPDATE chat_user_settings
             SET last_read_message_id = ?, last_read_at = ?, unread_count = 0, updated_at = ?
             WHERE user_id = ? AND chat_id = ?`,
            [messageId, now, now, uid, chatId]
          )
        } else {
          this.ensureSettingsRow({ userId: uid, chatId, now, unreadCount: 1 })
          // 直接做 +1（避免先读再写）
          const updated = this.db.rawRun(
            `UPDATE chat_user_settings
             SET unread_count = unread_count + 1, updated_at = ?
             WHERE user_id = ? AND chat_id = ?`,
            [now, uid, chatId]
          )
          if (updated.rowsAffected === 0) {
            // 兜底：如果 row 不存在，补一条
            this.ensureSettingsRow({ userId: uid, chatId, now, unreadCount: 1 })
          }
        }
      }
    })

    const messageTable = this.db.rawGet<MessageTable>('SELECT * FROM messages WHERE id = ?', [
      messageId
    ])!
    return messageTableToMessage(messageTable)
  }

  async getSettings(chatId: ChatId): Promise<ChatUserSettings | null> {
    const meId = await this.requireMe()
    const row = this.db.rawGet<ChatUserSettingsRow>(
      'SELECT * FROM chat_user_settings WHERE user_id = ? AND chat_id = ?',
      [meId, chatId]
    )
    return row ? settingsRowToModel(row) : null
  }

  async updateSettings(
    chatId: ChatId,
    input: { pinned?: boolean; muted?: boolean; archived?: boolean }
  ): Promise<ChatUserSettings> {
    const meId = await this.requireMe()
    const now = Date.now()
    this.ensureSettingsRow({ userId: meId, chatId, now })

    const patches: string[] = []
    const params: unknown[] = []
    if (input.pinned !== undefined) {
      patches.push('pinned = ?')
      params.push(input.pinned ? 1 : 0)
    }
    if (input.muted !== undefined) {
      patches.push('muted = ?')
      params.push(input.muted ? 1 : 0)
    }
    if (input.archived !== undefined) {
      patches.push('archived = ?')
      params.push(input.archived ? 1 : 0)
    }
    patches.push('updated_at = ?')
    params.push(now)
    params.push(meId, chatId)

    this.db.rawRun(
      `UPDATE chat_user_settings SET ${patches.join(', ')} WHERE user_id = ? AND chat_id = ?`,
      params
    )
    const row = this.db.rawGet<ChatUserSettingsRow>(
      'SELECT * FROM chat_user_settings WHERE user_id = ? AND chat_id = ?',
      [meId, chatId]
    )
    if (!row) throw new Error('更新会话设置失败')
    return settingsRowToModel(row)
  }

  async markRead(chatId: ChatId, lastReadMessageId?: MessageId): Promise<void> {
    const meId = await this.requireMe()
    const now = Date.now()
    this.ensureSettingsRow({ userId: meId, chatId, now })
    this.db.rawRun(
      `UPDATE chat_user_settings
       SET last_read_message_id = ?, last_read_at = ?, unread_count = 0, updated_at = ?
       WHERE user_id = ? AND chat_id = ?`,
      [lastReadMessageId ?? null, now, now, meId, chatId]
    )
  }
}
