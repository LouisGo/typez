import { setupDatabaseHandlers } from './database.handler'
import { setupAuthHandlers } from './auth.handler'
import { setupChatHandlers } from './chat.handler'
import type { DatabaseService } from '../database'

/**
 * 统一初始化所有 IPC Handlers
 */
export function setupIPC(db: DatabaseService): void {
  setupDatabaseHandlers(db)
  setupAuthHandlers()
  setupChatHandlers()

  console.log('[IPC] 所有 IPC Handlers 已注册')
}
