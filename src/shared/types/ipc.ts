// ============================================
// IPC Channel Definitions
// ============================================

/**
 * 定义主进程和渲染进程之间的 IPC 通信接口
 * 使用类型安全的通道定义，确保编译时检查
 */
export interface IPCChannels {
  // Database operations
  'db:query': { params: QueryParams; result: QueryResult }
  'db:insert': { params: InsertParams; result: InsertResult }
  'db:update': { params: UpdateParams; result: UpdateResult }
  'db:delete': { params: DeleteParams; result: DeleteResult }
  
  // Auth operations
  'auth:login': { params: LoginParams; result: UserData }
  'auth:logout': { params: void; result: void }
  'auth:getCurrentUser': { params: void; result: UserData | null }
}

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

// Auth types
export interface LoginParams {
  username: string
  password: string
}

export interface UserData {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
}
