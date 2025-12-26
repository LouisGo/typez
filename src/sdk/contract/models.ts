import type { Id } from '../core/branded'

// ============================================
// Branded ID Types
// ============================================

export type UserId = Id<'user'>
export type ChatId = Id<'chat'>
export type MessageId = Id<'message'>
export type ContactId = Id<'contact'>
export type ContactRequestId = Id<'contact_request'>
export type ChatMemberId = Id<'chat_member'>
export type MediaId = Id<'media'>

// ============================================
// Enums & Literals
// ============================================

export type UserStatus = 'online' | 'offline' | 'away' | 'busy'
export type UserKind = 'human' | 'bot' | 'system'
export type ChatType = 'private' | 'group' | 'channel'
export type MessageType = 'text' | 'image' | 'video' | 'file' | 'audio' | 'voice'
export type MemberRole = 'owner' | 'admin' | 'member'
export type MediaType = 'image' | 'video' | 'audio' | 'file' | 'voice'

/**
 * 本地发送状态（用于 UI optimistic update）
 * - 传输/后端落库后可扩展 delivered/read 等更细状态（见 MessageReceipt）
 */
export type MessageLocalStatus = 'sending' | 'sent' | 'failed'

export type ContactRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled'

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
  kind?: UserKind
  deletedAt?: number | null
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
  createdBy?: UserId | null
  metadata?: string | null
  deletedAt?: number | null
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
  clientId?: string | null
  status?: MessageLocalStatus
  editedAt?: number | null
  deletedAt?: number | null
  createdAt: number
  updatedAt: number
}

export interface Contact {
  id: ContactId
  userId: UserId
  contactUserId: UserId
  nickname: string | null
  blocked: boolean
  favorite: boolean
  createdAt: number
}

export interface ContactRequest {
  id: ContactRequestId
  fromUserId: UserId
  toUserId: UserId
  message: string | null
  status: ContactRequestStatus
  createdAt: number
  updatedAt: number
}

export interface ChatUserSettings {
  id: Id<'chat_user_settings'>
  userId: UserId
  chatId: ChatId
  pinned: boolean
  muted: boolean
  archived: boolean
  lastReadMessageId: MessageId | null
  lastReadAt: number | null
  unreadCount: number
  updatedAt: number
}

export interface MessageReceipt {
  id: Id<'message_receipt'>
  messageId: MessageId
  userId: UserId
  deliveredAt: number | null
  readAt: number | null
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
