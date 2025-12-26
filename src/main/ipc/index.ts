import { setupDatabaseHandlers } from './database.handler'
import { setupAuthHandlers } from './auth.handler'
import { setupChatHandlers } from './chat.handler'
import { setupContactHandlers } from './contact.handler'
import { setupGroupHandlers } from './group.handler'
import { setupSearchHandlers } from './search.handler'
import type { DatabaseService } from '../database'
import { initServices } from '../services'

/**
 * 统一初始化所有 IPC Handlers
 */
export function setupIPC(db: DatabaseService): void {
  // 先用同一连接初始化所有服务，避免重复创建 DatabaseService
  initServices(db)
  setupDatabaseHandlers(db)
  setupAuthHandlers()
  setupChatHandlers()
  setupContactHandlers()
  setupGroupHandlers()
  setupSearchHandlers()

  console.log('[IPC] 所有 IPC Handlers 已注册')
}
