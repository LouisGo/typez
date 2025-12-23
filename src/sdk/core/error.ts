import type { RPCError } from '@contracts/rpc'
import { CommonErrorCode } from '@contracts/rpc'

export class SDKError extends Error {
  readonly code: string
  readonly details?: unknown
  readonly traceId?: string
  readonly cause?: SDKError

  constructor(input: {
    code: string
    message: string
    details?: unknown
    traceId?: string
    cause?: SDKError
  }) {
    super(input.message)
    this.name = 'SDKError'
    this.code = input.code
    this.details = input.details
    this.traceId = input.traceId
    this.cause = input.cause
  }

  static fromRPCError(err: RPCError): SDKError {
    return new SDKError({
      code: err.code,
      message: err.message,
      details: err.details,
      traceId: err.traceId,
      cause: err.cause ? SDKError.fromRPCError(err.cause) : undefined
    })
  }

  static transportError(message: string, details?: unknown): SDKError {
    return new SDKError({ code: CommonErrorCode.TRANSPORT_ERROR, message, details })
  }
}
