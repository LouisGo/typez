// ============================================
// Database Schema Types
// ============================================

/**
 * 数据库表结构类型定义
 * 与 SQLite 数据库表结构一一对应
 */

export interface UserTable {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  phone: string | null
  bio: string | null
  status: UserStatus
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

// ============================================
// Enums
// ============================================

export type UserStatus = 'online' | 'offline' | 'away' | 'busy'

export type ChatType = 'private' | 'group' | 'channel'

export type MessageType = 'text' | 'image' | 'video' | 'file' | 'audio' | 'voice'

export type MemberRole = 'owner' | 'admin' | 'member'

export type MediaType = 'image' | 'video' | 'file' | 'audio'
