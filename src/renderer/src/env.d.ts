/// <reference types="vite/client" />

import type { IPCChannel, IPCParams, IPCResult } from '@sdk/types/ipc'

declare global {
  interface Window {
    /**
     * Electron preload 注入的类型安全 IPC 调用入口
     * 注意：跨边界返回的是可序列化的 Result Envelope（RPCResult<T>）
     */
    api: {
      invoke<C extends IPCChannel>(channel: C, params?: IPCParams<C>): Promise<IPCResult<C>>
    }
  }
}

export {}
