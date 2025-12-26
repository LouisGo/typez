// ============================================
// API Contract Definitions
// ============================================

import type {
  User,
  Chat,
  Message,
  UserId,
  ChatId,
  Contact,
  ContactRequest,
  ContactRequestId,
  ChatUserSettings
} from './models'
import type { ProtocolResult } from '../core/protocol'

/**
 * 定义主进程和渲染进程之间的通信契约
 * 使用类型安全的通道定义，确保编译时检查
 */
export interface APIContract {
  // Auth operations
  'auth:login': { params: LoginParams; result: ProtocolResult<User> }
  'auth:register': { params: RegisterParams; result: ProtocolResult<User> }
  'auth:logout': { params: LogoutParams; result: ProtocolResult<void> }
  'auth:me': { params: void; result: ProtocolResult<User | null> }

  // Chat/Messaging operations
  'chat:getConversations': { params: void; result: ProtocolResult<Chat[]> }
  'chat:getConversationById': { params: GetChatByIdParams; result: ProtocolResult<Chat | null> }
  'chat:getMessages': { params: GetMessagesParams; result: ProtocolResult<Message[]> }
  'chat:sendMessage': { params: SendMessageParams; result: ProtocolResult<Message> }

  // Chat settings / read state
  'chat:getSettings': {
    params: GetChatSettingsParams
    result: ProtocolResult<ChatUserSettings | null>
  }
  'chat:updateSettings': {
    params: UpdateChatSettingsParams
    result: ProtocolResult<ChatUserSettings>
  }
  'chat:markRead': { params: MarkChatReadParams; result: ProtocolResult<void> }

  // Group operations
  'group:create': { params: CreateGroupParams; result: ProtocolResult<Chat> }
  'group:addMembers': { params: AddGroupMembersParams; result: ProtocolResult<void> }
  'group:updateProfile': { params: UpdateGroupProfileParams; result: ProtocolResult<Chat> }

  // Contact operations
  'contact:list': { params: void; result: ProtocolResult<Contact[]> }
  'contact:request': { params: CreateContactRequestParams; result: ProtocolResult<ContactRequest> }
  'contact:respondRequest': { params: RespondContactRequestParams; result: ProtocolResult<Contact> }
  'contact:blockUser': { params: BlockUserParams; result: ProtocolResult<void> }

  // Search operations
  'search:users': { params: SearchUsersParams; result: ProtocolResult<User[]> }
  'search:messages': { params: SearchMessagesParams; result: ProtocolResult<Message[]> }

  // Database operations (internal/legacy)
  'db:query': { params: QueryParams; result: ProtocolResult<QueryResult> }
  'db:insert': { params: InsertParams; result: ProtocolResult<InsertResult> }
  'db:update': { params: UpdateParams; result: ProtocolResult<UpdateResult> }
  'db:delete': { params: DeleteParams; result: ProtocolResult<DeleteResult> }
}

/**
 * 定义服务端推送给客户端的事件契约
 */
export interface EventContract {
  'chat:message': Message
  'chat:unreadCount': { chatId: ChatId; unreadCount: number }
  'auth:status': { userId: UserId; status: import('./models').UserStatus }
  'contact:request': ContactRequest
}

export type EventChannel = keyof EventContract
export type EventPayload<E extends EventChannel> = EventContract[E]

// ============================================
// Type Utilities
// ============================================

export type ContractParams<Channel extends keyof APIContract> = APIContract[Channel]['params']
export type ContractResult<Channel extends keyof APIContract> = APIContract[Channel]['result']
export type ContractData<Channel extends keyof APIContract> =
  APIContract[Channel]['result'] extends ProtocolResult<infer T> ? T : never

export type APIChannel = keyof APIContract

// ============================================
// Auth Params
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
  userId: UserId
}

// ============================================
// Chat Params
// ============================================

export interface GetChatByIdParams {
  chatId: ChatId
}

export interface GetMessagesParams {
  chatId: ChatId
  limit?: number
  offset?: number
}

export interface SendMessageParams {
  chatId: ChatId
  content: string
}

// ============================================
// Chat Settings Params
// ============================================

export interface GetChatSettingsParams {
  chatId: ChatId
}

export interface UpdateChatSettingsParams {
  chatId: ChatId
  pinned?: boolean
  muted?: boolean
  archived?: boolean
}

export interface MarkChatReadParams {
  chatId: ChatId
  lastReadMessageId?: import('./models').MessageId
}

// ============================================
// Group Params
// ============================================

export interface CreateGroupParams {
  title: string
  memberIds: UserId[]
  description?: string
}

export interface AddGroupMembersParams {
  chatId: ChatId
  memberIds: UserId[]
}

export interface UpdateGroupProfileParams {
  chatId: ChatId
  title?: string
  avatarUrl?: string | null
  description?: string | null
}

// ============================================
// Contact Params
// ============================================

export interface CreateContactRequestParams {
  toUserId: UserId
  message?: string
}

export interface RespondContactRequestParams {
  requestId: ContactRequestId
  action: 'accept' | 'reject' | 'cancel'
}

export interface BlockUserParams {
  userId: UserId
  blocked: boolean
}

// ============================================
// Search Params
// ============================================

export interface SearchUsersParams {
  query: string
  limit?: number
  offset?: number
}

export interface SearchMessagesParams {
  query: string
  chatId?: ChatId
  limit?: number
  offset?: number
}

// ============================================
// Database Params (legacy)
// ============================================

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
