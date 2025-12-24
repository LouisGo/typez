import type {
  APIChannel,
  ContractParams,
  ContractResult,
  EventChannel,
  EventContract
} from '../../contract'
import type { ProtocolResult } from '../../core/protocol'
import { isProtocolResult } from '../../core/protocol'
import type { Transport } from '../../core/transport'

function normalizeProtocolResult<C extends APIChannel>(value: unknown): ContractResult<C> {
  // 兼容迁移期：如果 main 侧还没 envelope 化，这里把裸数据包装成 ok:true
  if (isProtocolResult(value)) return value as ContractResult<C>
  const wrapped: ProtocolResult<unknown> = { ok: true, data: value }
  return wrapped as ContractResult<C>
}

export function createElectronRendererTransport(): Transport {
  return {
    async request<C extends APIChannel>(
      channel: C,
      params?: ContractParams<C>
    ): Promise<ContractResult<C>> {
      // 注意：window.api 由 preload 注入。
      // 使用 any 避免与 renderer 侧 preload 定义冲突，同时保持 SDK 的独立性
      const raw = await (window as any).api.invoke(channel, params)
      return normalizeProtocolResult<C>(raw)
    },

    on<E extends EventChannel>(event: E, listener: (payload: EventContract[E]) => void): void {
      ;(window as any).api.on(event, (_event: any, payload: EventContract[E]) => listener(payload))
    },

    off<E extends EventChannel>(event: E, listener: (payload: EventContract[E]) => void): void {
      ;(window as any).api.off(event, listener)
    }
  }
}
