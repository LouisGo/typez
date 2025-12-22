import type { QueryParams, QueryResult, InsertParams, InsertResult } from '@shared/types/ipc'

/**
 * IPC Client - 渲染进程与主进程通信的客户端
 * 类型安全的封装
 */
export const ipcClient = {
  /**
   * Database operations
   */
  db: {
    query: (params: QueryParams): Promise<QueryResult> => {
      return window.api.db.query(params)
    },

    insert: (params: InsertParams): Promise<InsertResult> => {
      return window.api.db.insert(params)
    },

    update: (params: {
      table: string
      data: Record<string, unknown>
      where: Record<string, unknown>
    }): Promise<{ rowsAffected: number }> => {
      return window.api.db.update(params)
    },

    delete: (params: {
      table: string
      where: Record<string, unknown>
    }): Promise<{ rowsAffected: number }> => {
      return window.api.db.delete(params)
    },
  },

  /**
   * Auth operations
   */
  auth: {
    login: (params: { username: string; password: string }) => {
      return window.api.auth.login(params)
    },

    logout: () => {
      return window.api.auth.logout()
    },

    getCurrentUser: () => {
      return window.api.auth.getCurrentUser()
    },
  },
}

export type IPCClient = typeof ipcClient
