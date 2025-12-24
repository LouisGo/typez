import type { Id } from '../core/branded'

// ============================================
// Branded ID Types
// ============================================

export type UserId = Id<'user'>
export type ChatId = Id<'chat'>
export type MessageId = Id<'message'>

// ============================================
// Enums & Literals
// ============================================

export type UserStatus = 'online' | 'offline' | 'away' | 'busy'
export type ChatType = 'private' | 'group' | 'channel'
export type MessageType = 'text' | 'image' | 'video' | 'file' | 'audio' | 'voice'
export type MemberRole = 'owner' | 'admin' | 'member'
export type MediaType = 'image' | 'video' | 'audio' | 'file' | 'voice'

// ============================================
// Domain Models
// ============================================

/**
 * 用户模型
 */
export interface User {
  id: UserId
  username: string
  displayName: string
  avatarUrl: string | null
  phone: string | null
  bio: string | null
  status: UserStatus
  lastSeen: number
  createdAt: number
  updatedAt: number
}

/**
 * 聊天模型
 */
export interface Chat {
  id: ChatId
  type: ChatType
  title: string | null
  avatarUrl: string | null
  description: string | null
  memberCount: number
  lastMessageId: MessageId | null
  lastMessageAt: number | null
  pinned: boolean
  muted: boolean
  createdAt: number
  updatedAt: number
}

/**
 * 消息模型
 */
export interface Message {
  id: MessageId
  chatId: ChatId
  senderId: UserId
  content: string
  type: MessageType
  replyToId: MessageId | null
  forwardedFromId: MessageId | null
  edited: boolean
  read: boolean
  createdAt: number
  updatedAt: number
}

// ============================================
// Utilities
// ============================================

export interface PageCursor {
  offset: number
  limit: number
}

export interface Page<T> {
  items: T[]
  next?: PageCursor
}
