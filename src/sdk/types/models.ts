// ============================================
// Domain Models (camelCase)
// ============================================

/**
 * 领域模型类型定义
 * 用于 IPC 通信，采用 camelCase 命名
 * 这些类型由 Main 进程返回给 Renderer 进程
 */

export type UserStatus = 'online' | 'offline' | 'away' | 'busy'
export type ChatType = 'private' | 'group' | 'channel'
export type MessageType = 'text' | 'image' | 'video' | 'file' | 'audio' | 'voice'
export type MemberRole = 'owner' | 'admin' | 'member'
export type MediaType = 'image' | 'video' | 'file' | 'audio'

/**
 * 用户模型
 */
export interface User {
  id: string
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
  id: string
  type: ChatType
  title: string | null
  avatarUrl: string | null
  description: string | null
  memberCount: number
  lastMessageId: string | null
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
  id: string
  chatId: string
  senderId: string
  content: string
  type: MessageType
  replyToId: string | null
  forwardedFromId: string | null
  edited: boolean
  read: boolean
  createdAt: number
  updatedAt: number
}
