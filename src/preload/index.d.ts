import { ElectronAPI } from '@electron-toolkit/preload'
import type { QueryParams, QueryResult, InsertParams, InsertResult } from '@shared/types/ipc'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      invoke: (channel: string, data?: any) => Promise<any>
      db: {
        query: (params: QueryParams) => Promise<QueryResult>
        insert: (params: InsertParams) => Promise<InsertResult>
        update: (params: {
          table: string
          data: Record<string, unknown>
          where: Record<string, unknown>
        }) => Promise<{ rowsAffected: number }>
        delete: (params: {
          table: string
          where: Record<string, unknown>
        }) => Promise<{ rowsAffected: number }>
      }
      auth: {
        login: (params: { username: string; password: string }) => Promise<{
          id: string
          username: string
          displayName: string
          avatarUrl: string | null
        }>
        logout: () => Promise<void>
        getCurrentUser: () => Promise<{
          id: string
          username: string
          displayName: string
          avatarUrl: string | null
        } | null>
      }
    }
  }
}
