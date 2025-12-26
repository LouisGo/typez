/**
 * 数据转换工具
 * 将数据库表格式（snake_case）转换为领域模型格式（camelCase）
 */

import type { UserTable, ChatTable, MessageTable } from '../database/types'
import type { User, Chat, Message, UserId, ChatId, MessageId } from '@sdk/contract/models'

/**
 * 将 UserTable 转换为 User
 */
export function userTableToUser(table: UserTable): User {
  return {
    id: table.id as UserId,
    username: table.username,
    displayName: table.display_name,
    avatarUrl: table.avatar_url,
    phone: table.phone,
    bio: table.bio,
    status: table.status,
    kind: table.kind ?? 'human',
    deletedAt: table.deleted_at ?? null,
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
    id: table.id as ChatId,
    type: table.type,
    title: table.title,
    avatarUrl: table.avatar_url,
    description: table.description,
    memberCount: table.member_count,
    lastMessageId: table.last_message_id as MessageId | null,
    lastMessageAt: table.last_message_at,
    pinned: table.pinned,
    muted: table.muted,
    createdBy: (table.created_by as UserId | null) ?? null,
    metadata: table.metadata ?? null,
    deletedAt: table.deleted_at ?? null,
    createdAt: table.created_at,
    updatedAt: table.updated_at
  }
}

/**
 * 将 MessageTable 转换为 Message
 */
export function messageTableToMessage(table: MessageTable): Message {
  return {
    id: table.id as MessageId,
    chatId: table.chat_id as ChatId,
    senderId: table.sender_id as UserId,
    content: table.content,
    type: table.type,
    replyToId: table.reply_to_id as MessageId | null,
    forwardedFromId: table.forwarded_from_id as MessageId | null,
    edited: table.edited,
    read: table.read,
    clientId: table.client_id ?? null,
    status: table.status,
    editedAt: table.edited_at ?? null,
    deletedAt: table.deleted_at ?? null,
    createdAt: table.created_at,
    updatedAt: table.updated_at
  }
}
