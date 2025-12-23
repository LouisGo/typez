import type { Id } from '../../kernel/branded'

export type UserId = Id<'user'>
export type ChatId = Id<'chat'>
export type MessageId = Id<'message'>

export type ISODateString = string

export interface User {
  id: UserId
  displayName: string
  avatarColor?: string
}

export interface Chat {
  id: ChatId
  title: string
  type: 'direct' | 'group' | 'channel'
  memberCount: number
  lastMessagePreview?: string
  updatedAt: ISODateString
}

export interface Message {
  id: MessageId
  chatId: ChatId
  senderId: UserId
  text: string
  createdAt: ISODateString
}

export interface PageCursor {
  // 简化版：以“偏移量”作为 cursor（SQLite/服务端时可替换为 messageId/时间戳 cursor）
  offset: number
  limit: number
}

export interface Page<T> {
  items: T[]
  next?: PageCursor
}
