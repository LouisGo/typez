import type { DatabaseService } from '../database'
import type { ISearchService } from './search.service.interface'
import type { ChatId, Message, User } from '@sdk/contract/models'
import type { MessageTable, UserTable } from '../database/types'
import { messageTableToMessage, userTableToUser } from '../utils/transformers'

export class SearchService implements ISearchService {
  constructor(private db: DatabaseService) {}

  async searchUsers(query: string, limit: number = 20, offset: number = 0): Promise<User[]> {
    const q = query.trim()
    if (!q) return []
    // FTS5：用 user_id 回连 users 表
    const rows = this.db.rawAll<UserTable>(
      `
      SELECT u.*
      FROM users_fts
      JOIN users u ON u.id = users_fts.user_id
      WHERE users_fts MATCH ?
      LIMIT ? OFFSET ?
      `,
      [q, limit, offset]
    )
    return rows.map(userTableToUser)
  }

  async searchMessages(
    query: string,
    input?: { chatId?: ChatId; limit?: number; offset?: number }
  ): Promise<Message[]> {
    const q = query.trim()
    if (!q) return []
    const limit = input?.limit ?? 50
    const offset = input?.offset ?? 0

    const chatId = input?.chatId
    if (chatId) {
      const rows = this.db.rawAll<MessageTable>(
        `
        SELECT m.*
        FROM messages_fts
        JOIN messages m ON m.id = messages_fts.message_id
        WHERE messages_fts MATCH ? AND m.chat_id = ?
        ORDER BY m.created_at DESC
        LIMIT ? OFFSET ?
        `,
        [q, chatId, limit, offset]
      )
      return rows.map(messageTableToMessage)
    }

    const rows = this.db.rawAll<MessageTable>(
      `
      SELECT m.*
      FROM messages_fts
      JOIN messages m ON m.id = messages_fts.message_id
      WHERE messages_fts MATCH ?
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [q, limit, offset]
    )
    return rows.map(messageTableToMessage)
  }
}
