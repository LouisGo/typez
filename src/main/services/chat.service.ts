import { DatabaseService } from '../database'
import type { IChatService } from './chat.service.interface'
import type { ChatTable, MessageTable } from '@shared/types/database'

/**
 * 真实聊天服务 (SQLite 实现)
 */
export class ChatService implements IChatService {
  constructor(private db: DatabaseService) {}

  async getChats(): Promise<ChatTable[]> {
    const result = await this.db.query({
      table: 'chats'
    })
    return result.rows as ChatTable[]
  }

  async getChatById(id: string): Promise<ChatTable | null> {
    const result = await this.db.query({
      table: 'chats',
      where: { id }
    })
    return result.rows.length > 0 ? (result.rows[0] as ChatTable) : null
  }

  async getMessages(
    chatId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<MessageTable[]> {
    const result = await this.db.query({
      table: 'messages',
      where: { chat_id: chatId }
      // TODO: 支持 limit, offset 和排序
    })
    return result.rows as MessageTable[]
  }

  async sendMessage(chatId: string, content: string): Promise<MessageTable> {
    const now = Date.now()
    const messageId = crypto.randomUUID()

    // 这里简化处理，实际需要从 session 获取 senderId
    const senderId = 'placeholder'

    await this.db.insert({
      table: 'messages',
      data: {
        id: messageId,
        chat_id: chatId,
        sender_id: senderId,
        content,
        type: 'text',
        created_at: now,
        updated_at: now,
        read: false,
        edited: false
      }
    })

    // 更新聊天的最后一条消息
    await this.db.update({
      table: 'chats',
      data: {
        last_message_id: messageId,
        last_message_at: now,
        updated_at: now
      },
      where: { id: chatId }
    })

    const result = await this.db.query({
      table: 'messages',
      where: { id: messageId }
    })

    return result.rows[0] as MessageTable
  }
}
