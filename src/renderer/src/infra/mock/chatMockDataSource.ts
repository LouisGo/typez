import type { Chat, ChatId, Message, MessageId, Page, PageCursor, User, UserId } from '@shared/domains/chat/model'
import { createSeededRng, pickOne } from './seededRng'

function toIso(ms: number): string {
  return new Date(ms).toISOString()
}

function asId<T extends string>(raw: string) {
  return raw as any as import('@shared/kernel/branded').Id<T>
}

const WORDS = [
  'hello',
  'typing',
  'message',
  'router',
  'query',
  'zustand',
  'electron',
  'vite',
  'react',
  'tailwind',
  'im',
  'telegram'
] as const

export interface MockChatConfig {
  seed: number
  chatCount: number
  messagesPerChat: number
  membersPerChat: number
}

export class MockChatDataSource {
  private cfg: MockChatConfig
  private me: User

  constructor(cfg: MockChatConfig) {
    this.cfg = cfg
    this.me = {
      id: asId<'user'>('user-me') as UserId,
      displayName: 'Me',
      avatarColor: '#3b82f6'
    }
  }

  getMe(): User {
    return this.me
  }

  listChats(): Chat[] {
    const now = Date.now()
    const chats: Chat[] = []
    for (let i = 0; i < this.cfg.chatCount; i++) {
      const id = asId<'chat'>(`mock-${i + 1}`) as ChatId
      chats.push({
        id,
        title: `Mock Chat ${i + 1}`,
        type: i % 5 === 0 ? 'group' : 'direct',
        memberCount: this.cfg.membersPerChat,
        lastMessagePreview: '（mock）最后一条消息预览',
        updatedAt: toIso(now - i * 60_000)
      })
    }
    return chats
  }

  getMessagesPage(chatId: ChatId, cursor: PageCursor): Page<Message> {
    const total = this.cfg.messagesPerChat
    const start = Math.min(cursor.offset, total)
    const end = Math.min(start + cursor.limit, total)

    const items: Message[] = []
    for (let i = start; i < end; i++) {
      items.push(this.makeMessage(chatId, i))
    }

    const next =
      end < total
        ? {
            offset: end,
            limit: cursor.limit
          }
        : undefined

    return { items, next }
  }

  // 关键：不存数组，按 chatId + index 生成，可支撑“百万级消息”而不占内存
  private makeMessage(chatId: ChatId, index: number): Message {
    const seed = this.hash(`${this.cfg.seed}:${chatId}:${index}`)
    const rng = createSeededRng(seed)

    const senderId = (rng() < 0.6 ? this.me.id : asId<'user'>(`user-${Math.floor(rng() * 50)}`)) as UserId
    const wordCount = 3 + Math.floor(rng() * 14)
    const text = Array.from({ length: wordCount }, () => pickOne(rng, WORDS)).join(' ')

    const now = Date.now()
    const createdAt = toIso(now - (this.cfg.messagesPerChat - index) * 15_000)

    return {
      id: asId<'message'>(`msg:${chatId}:${index}`) as MessageId,
      chatId,
      senderId,
      text,
      createdAt
    }
  }

  private hash(s: string): number {
    // FNV-1a 32-bit
    let h = 0x811c9dc5
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i)
      h = Math.imul(h, 0x01000193)
    }
    return h | 0
  }
}


