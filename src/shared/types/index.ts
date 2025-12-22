// ============================================
// Domain Entity Types
// ============================================

/**
 * 领域实体类型 - 与数据库表类型不同
 * 包含业务逻辑和计算属性
 */

export * from './database'
export * from './ipc'

// Re-export commonly used types
export type { UserTable, ChatTable, MessageTable } from './database'
