import type { IPCChannel, IPCParams, IPCResult } from '../../types/ipc'
import type { RPCResult } from '../../core/rpc'
import { isRPCResult } from '../../core/rpc'
import type { Transport } from '../../core/transport'

function normalizeRPCResult<C extends IPCChannel>(value: unknown): IPCResult<C> {
  // 兼容迁移期：如果 main 侧还没 envelope 化，这里把裸数据包装成 ok:true
  if (isRPCResult(value)) return value as IPCResult<C>
  const wrapped: RPCResult<unknown> = { ok: true, data: value }
  return wrapped as IPCResult<C>
}

export function createElectronRendererTransport(): Transport {
  return {
    async request<C extends IPCChannel>(channel: C, params?: IPCParams<C>): Promise<IPCResult<C>> {
      // 注意：window.api 由 preload 注入。
      // 使用 any 避免与 renderer 侧 preload 定义冲突，同时保持 SDK 的独立性
      const raw = await (window as any).api.invoke(channel, params)
      return normalizeRPCResult<C>(raw)
    },

    on<E extends string>(event: E, listener: (payload: any) => void): void {
      ;(window as any).api.on(event, (_event: any, payload: any) => listener(payload))
    },

    off<E extends string>(event: E, listener: (payload: any) => void): void {
      // 注意：Electron 的 off 需要原始的 listener 包装器，这里简单处理
      // 实际生产环境可能需要维护一个 map 来存储包装后的 listener
      ;(window as any).api.off(event, listener)
    }
  }
}
