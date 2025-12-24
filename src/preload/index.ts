import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { APIChannel, ContractParams, ContractResult, EventChannel } from '@sdk/contract'

/**
 * 类型安全的 IPC 调用函数
 */
function invoke<C extends APIChannel>(
  channel: C,
  params?: ContractParams<C>
): Promise<ContractResult<C>> {
  return ipcRenderer.invoke(channel, params) as Promise<ContractResult<C>>
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

  /**
   * 订阅服务端推送事件
   */
  on: (channel: EventChannel, listener: (event: any, payload: any) => void) => {
    ipcRenderer.on(channel, listener)
  },

  /**
   * 取消订阅
   */
  off: (channel: EventChannel, listener: (event: any, payload: any) => void) => {
    ipcRenderer.removeListener(channel, listener)
  },

  // Database operations (保留兼容性，后续可迁移)
  db: {
    query: (params: ContractParams<'db:query'>) => invoke('db:query', params),
    insert: (params: ContractParams<'db:insert'>) => invoke('db:insert', params),
    update: (params: ContractParams<'db:update'>) => invoke('db:update', params),
    delete: (params: ContractParams<'db:delete'>) => invoke('db:delete', params)
  },
  // Auth operations
  auth: {
    login: (params: ContractParams<'auth:login'>) => invoke('auth:login', params),
    register: (params: ContractParams<'auth:register'>) => invoke('auth:register', params),
    logout: (params: ContractParams<'auth:logout'>) => invoke('auth:logout', params),
    me: () => invoke('auth:me')
  },
  // Chat operations
  chat: {
    getConversations: () => invoke('chat:getConversations'),
    getConversationById: (params: ContractParams<'chat:getConversationById'>) =>
      invoke('chat:getConversationById', params),
    getMessages: (params: ContractParams<'chat:getMessages'>) => invoke('chat:getMessages', params),
    sendMessage: (params: ContractParams<'chat:sendMessage'>) => invoke('chat:sendMessage', params)
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
