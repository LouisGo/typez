// ============================================
// Database Schema Types
// ============================================

/**
 * 数据库表结构类型定义
 * 与 SQLite 数据库表结构一一对应
 */

import type {
  UserStatus,
  UserKind,
  ChatType,
  MessageType,
  MemberRole,
  MediaType,
  MessageLocalStatus,
  ContactRequestStatus
} from '@sdk/contract/models'

export interface UserTable {
  id: string
  username: string
  display_name: string
  password: string
  avatar_url: string | null
  phone: string | null
  bio: string | null
  status: UserStatus
  kind?: UserKind
  deleted_at?: number | null
  last_seen: number
  created_at: number
  updated_at: number
}

export interface ChatTable {
  id: string
  type: ChatType
  title: string | null
  avatar_url: string | null
  description: string | null
  member_count: number
  last_message_id: string | null
  last_message_at: number | null
  pinned: boolean
  muted: boolean
  created_by?: string | null
  metadata?: string | null
  deleted_at?: number | null
  created_at: number
  updated_at: number
}

export interface MessageTable {
  id: string
  chat_id: string
  sender_id: string
  content: string
  type: MessageType
  reply_to_id: string | null
  forwarded_from_id: string | null
  edited: boolean
  read: boolean
  client_id?: string | null
  status?: MessageLocalStatus
  edited_at?: number | null
  deleted_at?: number | null
  created_at: number
  updated_at: number
}

export interface ChatMemberTable {
  id: string
  chat_id: string
  user_id: string
  role: MemberRole
  joined_at: number
  left_at: number | null
}

export interface ContactTable {
  id: string
  user_id: string
  contact_user_id: string
  nickname: string | null
  blocked: boolean
  favorite: boolean
  created_at: number
}

export interface MediaTable {
  id: string
  message_id: string
  type: MediaType
  url: string
  thumbnail_url: string | null
  file_name: string
  file_size: number
  mime_type: string
  width: number | null
  height: number | null
  duration: number | null
  created_at: number
}

export interface ContactRequestTable {
  id: string
  from_user_id: string
  to_user_id: string
  message: string | null
  status: ContactRequestStatus
  created_at: number
  updated_at: number
}

export interface ChatUserSettingsTable {
  id: string
  user_id: string
  chat_id: string
  pinned: boolean
  muted: boolean
  archived: boolean
  last_read_message_id: string | null
  last_read_at: number | null
  unread_count: number
  updated_at: number
}

export interface MessageReceiptTable {
  id: string
  message_id: string
  user_id: string
  delivered_at: number | null
  read_at: number | null
  created_at: number
  updated_at: number
}
