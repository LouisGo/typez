import type { IPCChannel, IPCParams, IPCResult } from '../types/ipc'

/**
 * 跨平台 Transport 抽象：
 * - Electron: window.api.invoke -> ipcRenderer.invoke
 * - Web: fetch
 * - RN: native module / fetch / websocket
 *
 * 注意：transport 返回的是跨边界可序列化的 IPCResult（即 RPCResult<T>）
 */
export interface Transport {
  request<C extends IPCChannel>(channel: C, params?: IPCParams<C>): Promise<IPCResult<C>>

  /**
   * 订阅服务端推送事件
   */
  on<E extends string>(event: E, listener: (payload: any) => void): void

  /**
   * 取消订阅
   */
  off<E extends string>(event: E, listener: (payload: any) => void): void
}
