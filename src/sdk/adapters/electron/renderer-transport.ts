import type { IPCChannel, IPCParams, IPCResult } from '@shared/types/ipc'
import type { RPCResult } from '@contracts/rpc'
import { isRPCResult } from '@contracts/rpc'
import type { Transport } from '@sdk/core/transport'

function normalizeRPCResult<C extends IPCChannel>(value: unknown): IPCResult<C> {
  // 兼容迁移期：如果 main 侧还没 envelope 化，这里把裸数据包装成 ok:true
  if (isRPCResult(value)) return value as IPCResult<C>
  const wrapped: RPCResult<unknown> = { ok: true, data: value }
  return wrapped as IPCResult<C>
}

export function createElectronRendererTransport(): Transport {
  return {
    async request<C extends IPCChannel>(channel: C, params?: IPCParams<C>): Promise<IPCResult<C>> {
      // 注意：window.api 由 preload 注入
      const raw = await window.api.invoke(channel, params)
      return normalizeRPCResult<C>(raw)
    }
  }
}
