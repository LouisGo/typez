import type { Chat } from '../domain/entities/chat.entity'
import type { Message } from '../domain/entities/message.entity'
import { ChatGenerator, MessageGenerator } from '@infra/mock/generators'

/**
 * Mock Chat Data Source
 */
export class MockChatDataSource {
  private chats: Chat[] = []
  private messages: Map<string, Message[]> = new Map()

  constructor() {
    this.initialize()
  }

  private initialize() {
    // 生成模拟聊天数据
    const chatData = ChatGenerator.generate(20)
    this.chats = chatData.map((chat) => {
      const chatEntity = {
        id: chat.id,
        type: chat.type,
        title: chat.title,
        avatarUrl: chat.avatar_url,
        description: chat.description,
        memberCount: chat.member_count,
        lastMessageId: chat.last_message_id,
        lastMessageAt: chat.last_message_at,
        pinned: chat.pinned,
        muted: chat.muted,
        createdAt: chat.created_at,
        updatedAt: chat.updated_at,
      } as any
      return chatEntity
    })

    // 为每个聊天生成消息
    this.chats.forEach((chat) => {
      const messageData = MessageGenerator.generate(chat.id, 50)
      this.messages.set(
        chat.id,
        messageData.map((msg) => msg as any)
      )
    })
  }

  async getChats(): Promise<Chat[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return this.chats
  }

  async getChatById(id: string): Promise<Chat | null> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return this.chats.find((chat) => chat.id === id) || null
  }

  async getMessages(chatId: string): Promise<Message[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return this.messages.get(chatId) || []
  }
}

export const mockChatDataSource = new MockChatDataSource()
