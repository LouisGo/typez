/**
 * 跨边界 RPC 协议：统一的可序列化 Result Envelope
 * - 传输层永远返回 ok/data 或 ok:false/error
 * - SDK 对外仍以 throw/reject 语义暴露
 */

export type RPCOk<T> = {
  ok: true
  data: T
}

export type RPCError = {
  /**
   * 稳定错误码（业务/系统）
   * 规范：<DOMAIN>/<CODE>
   * 例如：AUTH/USER_NOT_FOUND、DB/CONSTRAINT、SYSTEM/INTERNAL_ERROR
   */
  code: string
  /** 面向调用方的错误信息 */
  message: string
  /** 结构化详情（可选） */
  details?: unknown
  /** 追踪信息（可选） */
  traceId?: string
  /** 嵌套 cause（可选） */
  cause?: RPCError
}

export type RPCErr = {
  ok: false
  error: RPCError
}

export type RPCResult<T> = RPCOk<T> | RPCErr

export function isRPCResult(value: unknown): value is RPCResult<unknown> {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return 'ok' in v && v.ok === true ? 'data' in v : v.ok === false && 'error' in v
}

export const CommonErrorCode = {
  INTERNAL_ERROR: 'SYSTEM/INTERNAL_ERROR',
  TRANSPORT_ERROR: 'SYSTEM/TRANSPORT_ERROR'
} as const

export const ErrorDomain = {
  AUTH: 'AUTH',
  CHAT: 'CHAT',
  DB: 'DB',
  SYSTEM: 'SYSTEM',
  VALIDATION: 'VALIDATION'
} as const

export type ErrorDomain = (typeof ErrorDomain)[keyof typeof ErrorDomain]

export function makeErrorCode(domain: ErrorDomain, code: string): string {
  // 允许传入已经符合规范的 code（兼容调用方）
  if (code.includes('/')) return code
  return `${domain}/${code}`
}
