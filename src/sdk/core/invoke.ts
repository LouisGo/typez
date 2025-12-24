import type { IPCChannel, IPCData, IPCParams } from '../types/ipc'
import type { RPCResult } from './rpc'
import { SDKError } from '@sdk/core/error'
import type { Transport } from '@sdk/core/transport'

export async function invokeOrThrow<C extends IPCChannel>(
  transport: Transport,
  channel: C,
  params?: IPCParams<C>
): Promise<IPCData<C>> {
  let result: RPCResult<IPCData<C>>
  try {
    result = (await transport.request(channel, params)) as RPCResult<IPCData<C>>
  } catch (e) {
    throw SDKError.transportError('Transport 调用失败', e)
  }

  if (result.ok) return result.data
  throw SDKError.fromRPCError(result.error)
}
