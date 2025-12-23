import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { IPCChannel, IPCParams, IPCResult } from '@shared/types/ipc'

/**
 * 类型安全的 IPC 调用函数
 */
function invoke<C extends IPCChannel>(channel: C, params?: IPCParams<C>): Promise<IPCResult<C>> {
  return ipcRenderer.invoke(channel, params) as Promise<IPCResult<C>>
}

// Custom APIs for renderer
const api = {
  /**
   * 类型安全的通用 IPC 调用入口
   * @template C - IPC Channel 名称
   * @param channel - IPC Channel 名称
   * @param params - 请求参数（可选）
   * @returns Promise<IPCResult<C>> - 返回类型根据 channel 自动推导
   */
  invoke,

  // Database operations (保留兼容性，后续可迁移)
  db: {
    query: (params: IPCParams<'db:query'>) => invoke('db:query', params),
    insert: (params: IPCParams<'db:insert'>) => invoke('db:insert', params),
    update: (params: IPCParams<'db:update'>) => invoke('db:update', params),
    delete: (params: IPCParams<'db:delete'>) => invoke('db:delete', params)
  },
  // Auth operations
  auth: {
    login: (params: IPCParams<'auth:login'>) => invoke('auth:login', params),
    register: (params: IPCParams<'auth:register'>) => invoke('auth:register', params),
    logout: (params: IPCParams<'auth:logout'>) => invoke('auth:logout', params),
    getCurrentUser: (params: IPCParams<'auth:getCurrentUser'>) =>
      invoke('auth:getCurrentUser', params)
  },
  // Chat operations
  chat: {
    getChats: () => invoke('chat:getChats'),
    getChatById: (params: IPCParams<'chat:getChatById'>) => invoke('chat:getChatById', params),
    getMessages: (params: IPCParams<'chat:getMessages'>) => invoke('chat:getMessages', params),
    sendMessage: (params: IPCParams<'chat:sendMessage'>) => invoke('chat:sendMessage', params)
  }
}

export type Api = typeof api

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
