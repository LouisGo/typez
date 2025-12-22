import type { IChatService } from '../../services/chat.service.interface'
import type { ChatTable, MessageTable } from '@shared/types/database'
import { ChatGenerator, MessageGenerator } from '../generators'

/**
 * Mock 聊天服务
 */
export class MockChatService implements IChatService {
  private chats: ChatTable[] = []
  private messages: Map<string, MessageTable[]> = new Map()

  constructor() {
    this.initialize()
  }

  private initialize() {
    // 生成模拟聊天数据
    this.chats = ChatGenerator.generate(20)

    // 为每个聊天生成消息
    this.chats.forEach((chat) => {
      const messageData = MessageGenerator.generate(chat.id, 50)
      this.messages.set(chat.id, messageData)
    })
  }

  async getChats(): Promise<ChatTable[]> {
    await this.delay(300)
    return this.chats
  }

  async getChatById(id: string): Promise<ChatTable | null> {
    await this.delay(200)
    return this.chats.find((chat) => chat.id === id) || null
  }

  async getMessages(chatId: string, limit: number = 50, offset: number = 0): Promise<MessageTable[]> {
    await this.delay(300)
    const chatMessages = this.messages.get(chatId) || []
    return chatMessages.slice(offset, offset + limit)
  }

  async sendMessage(chatId: string, content: string): Promise<MessageTable> {
    await this.delay(200)
    const newMessage = MessageGenerator.generateOne(chatId)
    newMessage.content = content
    newMessage.created_at = Date.now()
    
    const chatMessages = this.messages.get(chatId) || []
    chatMessages.unshift(newMessage) // 新消息放在开头（模拟倒序）
    this.messages.set(chatId, chatMessages)
    
    // 更新最后一条消息
    const chat = this.chats.find(c => c.id === chatId)
    if (chat) {
      chat.last_message_id = newMessage.id
      chat.last_message_at = newMessage.created_at
    }

    return newMessage
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
