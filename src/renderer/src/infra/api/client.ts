type RequestInterceptor = (channel: string, params: any) => { channel: string; params: any }
type ResponseInterceptor = (data: any) => any
type ErrorHandler = (error: any) => void

/**
 * API 客户端
 * 统一管理所有 IPC 调用，类似传统 Web 应用的 HTTP 客户端
 */
class APIClient {
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private errorHandlers: ErrorHandler[] = []

  /**
   * 统一 API 调用方法
   */
  async invoke<T>(channel: string, params?: any): Promise<T> {
    try {
      // 1. 请求拦截
      let processedChannel = channel
      let processedParams = params

      for (const interceptor of this.requestInterceptors) {
        const result = interceptor(processedChannel, processedParams)
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
        processedResult = interceptor(processedResult)
      }

      return processedResult
    } catch (error: any) {
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
  .useErrorHandler((error) => {
    // 全局错误处理，如显示 Toast
    // toast.error(error.message)
  })


