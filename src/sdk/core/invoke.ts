import type { APIChannel, ContractData, ContractParams } from '../contract'
import type { ProtocolResult } from './protocol'
import { SDKError } from '@sdk/core/error'
import type { Transport } from '@sdk/core/transport'

export async function invokeOrThrow<C extends APIChannel>(
  transport: Transport,
  channel: C,
  params?: ContractParams<C>
): Promise<ContractData<C>> {
  let result: ProtocolResult<ContractData<C>>
  try {
    result = (await transport.request(channel, params)) as ProtocolResult<ContractData<C>>
  } catch (e: unknown) {
    const detail = e instanceof Error ? e.message : String(e)
    throw SDKError.transportError(`Transport 调用失败: ${detail}`, e)
  }

  if (result.ok) return result.data
  throw SDKError.fromProtocolError(result.error)
}
