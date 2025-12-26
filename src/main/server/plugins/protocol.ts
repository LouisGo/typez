import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'
import { isProtocolResult } from '@sdk/core/protocol'
import type { ProtocolResult } from '@sdk/core/protocol'
import { serializeError } from '../protocol/serialize-error'

/**
 * 将 HTTP 层响应统一包装为 ProtocolResult<T>（ok/data|error），以便 SDK/Transport 复用同一套语义。
 *
 * - handler 正常返回任意 JSON 数据 -> 自动包装成 { ok: true, data }
 * - 抛错/异常 -> 统一包装成 { ok: false, error }（并保持 200，方便客户端只按 envelope 处理）
 */
export const protocolPlugin: FastifyPluginAsync = fp(async (server) => {
  server.setErrorHandler((err, _req, reply) => {
    const payload: ProtocolResult<unknown> = { ok: false, error: serializeError(err) }
    reply.status(200).send(payload)
  })

  // 用 preSerialization（而不是 onSend），确保拿到的是“未序列化”的 payload；
  // 否则 onSend 阶段 payload 往往已经是 string，导致 envelope 没被包装，SDK 侧解析失败。
  server.addHook('preSerialization', async (_req, _reply, payload) => {
    if (isProtocolResult(payload)) return payload
    const wrapped: ProtocolResult<unknown> = { ok: true, data: payload ?? null }
    return wrapped
  })
})
