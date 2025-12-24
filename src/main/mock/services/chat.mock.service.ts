import type { IChatService } from '../../services/chat.service.interface'
import type { ChatTable, MessageTable } from '../../database/types'
import type { Chat, Message, ChatId } from '@sdk/contract/models'
import { chatTableToChat, messageTableToMessage } from '../../utils/transformers'
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

  async getChats(): Promise<Chat[]> {
    await this.delay(300)
    return this.chats.map(chatTableToChat)
  }

  async getChatById(id: ChatId): Promise<Chat | null> {
    await this.delay(200)
    const chat = this.chats.find((chat) => chat.id === id) || null
    return chat ? chatTableToChat(chat) : null
  }

  async getMessages(chatId: ChatId, limit: number = 50, offset: number = 0): Promise<Message[]> {
    await this.delay(300)
    const chatMessages = this.messages.get(chatId as string) || []
    return chatMessages.slice(offset, offset + limit).map(messageTableToMessage)
  }

  async sendMessage(chatId: ChatId, content: string): Promise<Message> {
    await this.delay(200)
    const newMessage = MessageGenerator.generateOne(chatId as string)
    newMessage.content = content
    newMessage.created_at = Date.now()

    const chatMessages = this.messages.get(chatId as string) || []
    chatMessages.unshift(newMessage) // 新消息放在开头（模拟倒序）
    this.messages.set(chatId as string, chatMessages)

    // 更新最后一条消息
    const chat = this.chats.find((c) => c.id === (chatId as string))
    if (chat) {
      chat.last_message_id = newMessage.id
      chat.last_message_at = newMessage.created_at
    }

    return messageTableToMessage(newMessage)
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
