/// <reference types="vite/client" />

import type { APIChannel, ContractParams, ContractResult, EventChannel } from '@sdk/contract'

declare global {
  interface Window {
    /**
     * Electron preload 注入的类型安全 IPC 调用入口
     * 注意：跨边界返回的是可序列化的 Result Envelope（ProtocolResult<T>）
     */
    api: {
      invoke<C extends APIChannel>(
        channel: C,
        params?: ContractParams<C>
      ): Promise<ContractResult<C>>
      on<E extends EventChannel>(channel: E, listener: (event: any, payload: any) => void): void
      off<E extends EventChannel>(channel: E, listener: (event: any, payload: any) => void): void
    }
  }
}

export {}
