import type { IPCChannel, IPCParams, IPCResult } from '@shared/types/ipc'

type RequestInterceptor = <C extends IPCChannel>(
  channel: C,
  params: IPCParams<C>
) => { channel: C; params: IPCParams<C> }

type ResponseInterceptor = <T>(data: T) => T

type ErrorHandler = (error: unknown) => void

/**
 * API 客户端
 * 统一管理所有 IPC 调用，类似传统 Web 应用的 HTTP 客户端
 * 完全类型安全，支持自动类型推导
 */
class APIClient {
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private errorHandlers: ErrorHandler[] = []

  /**
   * 类型安全的统一 API 调用方法
   * @template C - IPC Channel 名称
   * @param channel - IPC Channel 名称
   * @param params - 请求参数（可选，根据 channel 自动推导类型）
   * @returns Promise<IPCResult<C>> - 返回类型根据 channel 自动推导
   */
  async invoke<C extends IPCChannel>(channel: C, params?: IPCParams<C>): Promise<IPCResult<C>> {
    try {
      // 1. 请求拦截
      let processedChannel: C = channel
      let processedParams: IPCParams<C> | undefined = params

      for (const interceptor of this.requestInterceptors) {
        const result = interceptor(processedChannel, processedParams as IPCParams<C>)
        processedChannel = result.channel
        processedParams = result.params
      }

      // 2. 记录请求日志
      const isDev = import.meta.env.DEV
      if (isDev) {
        console.log(`[API] → ${processedChannel}`, processedParams)
      }

      // 3. 调用 IPC
      const startTime = Date.now()
      const result = await window.api.invoke(processedChannel, processedParams)
      const duration = Date.now() - startTime

      // 4. 记录响应日志
      if (isDev) {
        console.log(`[API] ← ${processedChannel} (${duration}ms)`, result)
      }

      // 5. 响应拦截
      let processedResult = result
      for (const interceptor of this.responseInterceptors) {
        processedResult = interceptor(processedResult) as IPCResult<C>
      }

      return processedResult
    } catch (error: unknown) {
      console.error(`[API] ✗ ${channel}`, error)

      // 6. 错误处理
      for (const handler of this.errorHandlers) {
        handler(error)
      }

      throw error
    }
  }

  /**
   * 注册请求拦截器
   */
  useRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor)
    return this
  }

  /**
   * 注册响应拦截器
   */
  useResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor)
    return this
  }

  /**
   * 注册错误处理器
   */
  useErrorHandler(handler: ErrorHandler) {
    this.errorHandlers.push(handler)
    return this
  }
}

// 创建单例
export const apiClient = new APIClient()

// 全局拦截器配置
apiClient
  .useRequestInterceptor((channel, params) => {
    // 可以在这里添加通用参数，如用户 token
    return { channel, params }
  })
  .useResponseInterceptor((data) => {
    // 可以在这里处理通用响应格式
    return data
  })
  .useErrorHandler(() => {
    // 全局错误处理，如显示 Toast
    // toast.error(error.message)
  })
