import type { ChatRepository } from '@shared/domains/chat/repository'
import type { Chat, ChatId, Message, Page, PageCursor } from '@shared/domains/chat/model'
import { MockChatDataSource } from './chatMockDataSource'

export class MockChatRepository implements ChatRepository {
  private ds: MockChatDataSource

  constructor(ds?: MockChatDataSource) {
    this.ds =
      ds ??
      new MockChatDataSource({
        seed: 42,
        chatCount: 50,
        messagesPerChat: 5000,
        membersPerChat: 12
      })
  }

  async listChats(): Promise<Chat[]> {
    return this.ds.listChats()
  }

  async getMessagesPage(chatId: ChatId, cursor: PageCursor): Promise<Page<Message>> {
    return this.ds.getMessagesPage(chatId, cursor)
  }

  async sendMessage(chatId: ChatId, text: string): Promise<Message> {
    // mock：直接返回一条“新消息”，真实实现会写入 SQLite/Server
    const now = new Date().toISOString()
    return {
      id: (`msg:${chatId}:client-${now}` as any) satisfies Message['id'],
      chatId,
      senderId: this.ds.getMe().id,
      text,
      createdAt: now
    }
  }
}


