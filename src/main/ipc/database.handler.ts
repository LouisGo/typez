import { ipcMain } from 'electron'
import type { DatabaseService } from '../database'

/**
 * 数据库 IPC Handlers
 * 处理渲染进程的数据库请求
 */
export function setupDatabaseHandlers(db: DatabaseService): void {
  // Query handler
  ipcMain.handle('db:query', async (_, params) => {
    return db.query(params)
  })

  // Insert handler
  ipcMain.handle('db:insert', async (_, params) => {
    return db.insert(params)
  })

  // Update handler
  ipcMain.handle('db:update', async (_, params) => {
    return db.update(params)
  })

  // Delete handler
  ipcMain.handle('db:delete', async (_, params) => {
    return db.delete(params)
  })
}
