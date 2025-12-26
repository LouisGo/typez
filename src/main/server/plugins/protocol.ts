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

  server.addHook('onSend', async (_req, _reply, payload) => {
    // payload 可能是 string/buffer/object；我们只对 object 做包装
    if (payload && typeof payload === 'object') {
      if (isProtocolResult(payload)) return payload
      const wrapped: ProtocolResult<unknown> = { ok: true, data: payload }
      return wrapped
    }
    return payload
  })
})
