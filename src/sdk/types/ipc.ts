// ============================================
// IPC Channel Definitions
// ============================================

import type { User, Chat, Message } from './models'
import type { RPCResult } from '../core/rpc'

/**
 * 定义主进程和渲染进程之间的 IPC 通信接口
 * 使用类型安全的通道定义，确保编译时检查
 *
 * 每个 channel 定义包含：
 * - params: 请求参数类型
 * - result: 响应结果类型
 */
export interface IPCChannels {
  // Database operations (keep for internal use)
  'db:query': { params: QueryParams; result: RPCResult<QueryResult> }
  'db:insert': { params: InsertParams; result: RPCResult<InsertResult> }
  'db:update': { params: UpdateParams; result: RPCResult<UpdateResult> }
  'db:delete': { params: DeleteParams; result: RPCResult<DeleteResult> }

  // Auth operations
  'auth:login': { params: LoginParams; result: RPCResult<User> }
  'auth:register': { params: RegisterParams; result: RPCResult<User> }
  'auth:logout': { params: LogoutParams; result: RPCResult<void> }
  'auth:me': { params: void; result: RPCResult<User | null> }

  // Chat/Messaging operations
  'chat:getConversations': { params: void; result: RPCResult<Chat[]> }
  'chat:getConversationById': { params: GetChatByIdParams; result: RPCResult<Chat | null> }
  'chat:getMessages': { params: GetMessagesParams; result: RPCResult<Message[]> }
  'chat:sendMessage': { params: SendMessageParams; result: RPCResult<Message> }
}

/**
 * 定义服务端推送给客户端的事件
 */
export interface IPCEvents {
  'chat:message': Message
  'chat:unreadCount': { chatId: string; unreadCount: number }
  'auth:status': { userId: string; status: import('./models').UserStatus }
}

export type IPCEvent = keyof IPCEvents
export type IPCEventPayload<E extends IPCEvent> = IPCEvents[E]

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
 * 提取 IPC Channel 的数据载荷类型（即 RPCResult<T> 中的 T）
 */
export type IPCData<Channel extends keyof IPCChannels> =
  IPCChannels[Channel]['result'] extends RPCResult<infer T> ? T : never

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
