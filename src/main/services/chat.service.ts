import { DatabaseService } from '../database'
import type { IChatService } from './chat.service.interface'
import type { ChatTable, MessageTable } from '../database/types'
import type { Chat, Message, ChatId } from '@sdk/contract/models'
import { chatTableToChat, messageTableToMessage } from '../utils/transformers'

/**
 * 真实聊天服务 (SQLite 实现)
 * 负责数据转换：snake_case (数据库) → camelCase (领域模型)
 */
export class ChatService implements IChatService {
  constructor(private db: DatabaseService) {}

  async getChats(): Promise<Chat[]> {
    const result = await this.db.query({
      table: 'chats'
    })
    const chatTables = result.rows as ChatTable[]
    return chatTables.map(chatTableToChat)
  }

  async getChatById(id: ChatId): Promise<Chat | null> {
    const result = await this.db.query({
      table: 'chats',
      where: { id: id as string }
    })
    if (result.rows.length === 0) {
      return null
    }
    const chatTable = result.rows[0] as ChatTable
    return chatTableToChat(chatTable)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getMessages(chatId: ChatId, _limit: number = 50, _offset: number = 0): Promise<Message[]> {
    const result = await this.db.query({
      table: 'messages',
      where: { chat_id: chatId as string }
      // TODO: 支持 limit, offset 和排序
    })
    const messageTables = result.rows as MessageTable[]
    return messageTables.map(messageTableToMessage)
  }

  async sendMessage(chatId: ChatId, content: string): Promise<Message> {
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

    const messageTable = result.rows[0] as MessageTable
    return messageTableToMessage(messageTable)
  }
}
