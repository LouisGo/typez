import type {
  APIChannel,
  ContractParams,
  ContractResult,
  EventChannel,
  EventContract
} from '../contract'

/**
 * 跨平台 Transport 抽象：
 * - Electron: window.api.invoke -> ipcRenderer.invoke
 * - Web: fetch
 * - RN: native module / fetch / websocket
 *
 * 注意：transport 返回的是跨边界可序列化的 ProtocolResult
 */
export interface Transport {
  request<C extends APIChannel>(channel: C, params?: ContractParams<C>): Promise<ContractResult<C>>

  /**
   * 订阅服务端推送事件
   */
  on<E extends EventChannel>(event: E, listener: (payload: EventContract[E]) => void): void

  /**
   * 取消订阅
   */
  off<E extends EventChannel>(event: E, listener: (payload: EventContract[E]) => void): void
}
