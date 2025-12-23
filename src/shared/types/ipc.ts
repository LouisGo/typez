// ============================================
// IPC Channel Definitions
// ============================================

import type { User, Chat, Message } from './models'

/**
 * 定义主进程和渲染进程之间的 IPC 通信接口
 * 使用类型安全的通道定义，确保编译时检查
 *
 * 每个 channel 定义包含：
 * - params: 请求参数类型
 * - result: 响应结果类型
 */
export interface IPCChannels {
  // Database operations
  'db:query': { params: QueryParams; result: QueryResult }
  'db:insert': { params: InsertParams; result: InsertResult }
  'db:update': { params: UpdateParams; result: UpdateResult }
  'db:delete': { params: DeleteParams; result: DeleteResult }

  // Auth operations
  'auth:login': { params: LoginParams; result: User }
  'auth:register': { params: RegisterParams; result: User }
  'auth:logout': { params: LogoutParams; result: void }
  'auth:getCurrentUser': { params: GetCurrentUserParams; result: User | null }

  // Chat operations
  'chat:getChats': { params: void; result: Chat[] }
  'chat:getChatById': { params: GetChatByIdParams; result: Chat | null }
  'chat:getMessages': { params: GetMessagesParams; result: Message[] }
  'chat:sendMessage': { params: SendMessageParams; result: Message }
}

// ============================================
// Type Utilities
// ============================================

/**
 * 提取 IPC Channel 的参数类型
 */
export type IPCParams<Channel extends keyof IPCChannels> = IPCChannels[Channel]['params']

/**
 * 提取 IPC Channel 的返回类型
 */
export type IPCResult<Channel extends keyof IPCChannels> = IPCChannels[Channel]['result']

/**
 * 提取所有 IPC Channel 名称的联合类型
 */
export type IPCChannel = keyof IPCChannels

// Database operation types
export interface QueryParams {
  table: string
  where?: Record<string, unknown>
  limit?: number
  offset?: number
  orderBy?: { field: string; direction: 'asc' | 'desc' }
}

export interface QueryResult {
  rows: unknown[]
  total: number
}

export interface InsertParams {
  table: string
  data: Record<string, unknown>
}

export interface InsertResult {
  id: string
  rowsAffected: number
}

export interface UpdateParams {
  table: string
  data: Record<string, unknown>
  where: Record<string, unknown>
}

export interface UpdateResult {
  rowsAffected: number
}

export interface DeleteParams {
  table: string
  where: Record<string, unknown>
}

export interface DeleteResult {
  rowsAffected: number
}

// ============================================
// Auth Types
// ============================================

export interface LoginParams {
  username: string
  password: string
}

export interface RegisterParams {
  username: string
  displayName: string
  password: string
}

export interface LogoutParams {
  userId: string
}

export interface GetCurrentUserParams {
  userId: string
}

// ============================================
// Chat Types
// ============================================

export interface GetChatByIdParams {
  chatId: string
}

export interface GetMessagesParams {
  chatId: string
  limit?: number
  offset?: number
}

export interface SendMessageParams {
  chatId: string
  content: string
}
