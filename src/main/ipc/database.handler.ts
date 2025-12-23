import type { DatabaseService } from '../database'
import { createHandler } from './utils'

/**
 * 数据库 IPC Handlers
 * 处理渲染进程的数据库请求
 */
export function setupDatabaseHandlers(db: DatabaseService): void {
  // Query handler
  createHandler('db:query', async (params) => {
    return db.query(params)
  })

  // Insert handler
  createHandler('db:insert', async (params) => {
    return db.insert(params)
  })

  // Update handler
  createHandler('db:update', async (params) => {
    return db.update(params)
  })

  // Delete handler
  createHandler('db:delete', async (params) => {
    return db.delete(params)
  })
}
