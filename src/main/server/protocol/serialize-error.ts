import { AuthError } from '@sdk/auth/errors'
import type { ProtocolError } from '@sdk/core/protocol'
import { CommonErrorCode, ErrorDomain, makeErrorCode } from '@sdk/core/protocol'

function isDomainCode(value: unknown): value is string {
  return typeof value === 'string' && value.includes('/')
}

function normalizeDomainCode(input: {
  domain: (typeof ErrorDomain)[keyof typeof ErrorDomain]
  code: string
}): string {
  return makeErrorCode(input.domain, input.code)
}

function tryMapSqliteError(error: Error): ProtocolError | null {
  const sqliteErr = error as unknown as Record<string, unknown>
  const rawCode: unknown = sqliteErr?.code
  const message = error.message || '数据库错误'

  // 常见 sqlite code：SQLITE_CONSTRAINT / SQLITE_BUSY / SQLITE_ERROR ...
  if (typeof rawCode === 'string' && rawCode.startsWith('SQLITE_')) {
    const mapped =
      rawCode === 'SQLITE_CONSTRAINT'
        ? 'CONSTRAINT'
        : rawCode === 'SQLITE_BUSY'
          ? 'BUSY'
          : rawCode === 'SQLITE_ERROR'
            ? 'ERROR'
            : rawCode
    return {
      code: normalizeDomainCode({ domain: ErrorDomain.DB, code: mapped }),
      message,
      details: { sqlite: { code: rawCode } }
    }
  }

  // 兼容一些错误信息模式
  if (message.includes('UNIQUE constraint')) {
    return {
      code: normalizeDomainCode({ domain: ErrorDomain.DB, code: 'UNIQUE_CONSTRAINT' }),
      message,
      details: { sqlite: { reason: 'UNIQUE_CONSTRAINT' } }
    }
  }

  return null
}

export function serializeError(error: unknown): ProtocolError {
  if (error instanceof AuthError) {
    return {
      code: normalizeDomainCode({ domain: ErrorDomain.AUTH, code: String(error.code) }),
      message: error.message
    }
  }

  // 如果上游已经按规范提供了 code（跨模块/未来扩展），尽量保留
  if (error && typeof error === 'object') {
    const errObj = error as Record<string, unknown>
    const code: unknown = errObj?.code
    const message: unknown = errObj?.message
    const details: unknown = errObj?.details

    if (isDomainCode(code)) {
      return {
        code,
        message: typeof message === 'string' && message.length > 0 ? message : '请求失败',
        details
      }
    }
  }

  if (error instanceof Error) {
    const dbErr = tryMapSqliteError(error)
    if (dbErr) return dbErr

    return {
      code: CommonErrorCode.INTERNAL_ERROR,
      message: error.message,
      details: {
        name: error.name
      }
    }
  }

  return {
    code: CommonErrorCode.INTERNAL_ERROR,
    message: '未知错误'
  }
}
