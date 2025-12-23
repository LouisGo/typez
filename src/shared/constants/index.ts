// ============================================
// Shared Constants
// ============================================

/**
 * 应用级常量定义
 */

export const APP_NAME = 'Typez'
export const APP_VERSION = '1.0.0'

// Database
export const DB_NAME = 'typez.db'
export const DB_VERSION = 1

// IPC Channels - 与 types/ipc.ts 保持一致
export const IPC_CHANNELS = {
  DB: {
    QUERY: 'db:query',
    INSERT: 'db:insert',
    UPDATE: 'db:update',
    DELETE: 'db:delete'
  },
  AUTH: {
    LOGIN: 'auth:login',
    LOGOUT: 'auth:logout',
    GET_CURRENT_USER: 'auth:getCurrentUser'
  }
} as const

// Message limits
export const MESSAGE_MAX_LENGTH = 4096
export const CHAT_TITLE_MAX_LENGTH = 128

// Pagination
export const DEFAULT_PAGE_SIZE = 50
export const MAX_PAGE_SIZE = 100
