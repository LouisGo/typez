/**
 * 数据转换工具
 * 将数据库表格式（snake_case）转换为领域模型格式（camelCase）
 */

import type { UserTable, ChatTable, MessageTable } from '@shared/types/database'
import type { User, Chat, Message } from '@shared/types/models'

/**
 * 将 UserTable 转换为 User
 */
export function userTableToUser(table: UserTable): User {
  return {
    id: table.id,
    username: table.username,
    displayName: table.display_name,
    avatarUrl: table.avatar_url,
    phone: table.phone,
    bio: table.bio,
    status: table.status,
    lastSeen: table.last_seen,
    createdAt: table.created_at,
    updatedAt: table.updated_at
  }
}

/**
 * 将 ChatTable 转换为 Chat
 */
export function chatTableToChat(table: ChatTable): Chat {
  return {
    id: table.id,
    type: table.type,
    title: table.title,
    avatarUrl: table.avatar_url,
    description: table.description,
    memberCount: table.member_count,
    lastMessageId: table.last_message_id,
    lastMessageAt: table.last_message_at,
    pinned: table.pinned,
    muted: table.muted,
    createdAt: table.created_at,
    updatedAt: table.updated_at
  }
}

/**
 * 将 MessageTable 转换为 Message
 */
export function messageTableToMessage(table: MessageTable): Message {
  return {
    id: table.id,
    chatId: table.chat_id,
    senderId: table.sender_id,
    content: table.content,
    type: table.type,
    replyToId: table.reply_to_id,
    forwardedFromId: table.forwarded_from_id,
    edited: table.edited,
    read: table.read,
    createdAt: table.created_at,
    updatedAt: table.updated_at
  }
}
