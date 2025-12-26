import type { APIChannel, ContractData, ContractParams } from '../contract'
import type { ProtocolResult } from './protocol'
import { isProtocolResult } from './protocol'
import { SDKError } from '@sdk/core/error'
import type { Transport } from '@sdk/core/transport'

export async function invokeOrThrow<C extends APIChannel>(
  transport: Transport,
  channel: C,
  params?: ContractParams<C>
): Promise<ContractData<C>> {
  let raw: unknown
  try {
    raw = await transport.request(channel, params)
  } catch (e: unknown) {
    const detail = e instanceof Error ? e.message : String(e)
    throw SDKError.transportError(`Transport 调用失败: ${detail}`, e)
  }

  if (!isProtocolResult(raw)) {
    throw SDKError.transportError('服务端返回不符合 ProtocolResult 规范（缺少 ok/data|error）', raw)
  }

  const result = raw as ProtocolResult<ContractData<C>>
  if (result.ok) return result.data
  // 兜底：防止错误体缺失导致 SDKError.fromProtocolError 直接 TypeError
  if (!result.error) {
    throw SDKError.transportError('服务端返回 ok:false 但缺少 error 字段', result)
  }
  throw SDKError.fromProtocolError(result.error)
}
