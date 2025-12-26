import { session } from 'electron'

import { getRendererCspFor } from './csp'

let installed = false

/**
 * dev 模式下 renderer 由 Vite dev server 提供（HTTP），这里用 webRequest 注入 CSP header。
 * 注意：这里是“覆盖/设置响应头”，不会与 renderer HTML meta CSP 取交集（因为我们已移除 meta）。
 */
export function installDevRendererCspHeaders(rendererUrl: string): void {
  if (installed) return
  installed = true

  let origin: string
  try {
    origin = new URL(rendererUrl).origin
  } catch {
    // rendererUrl 非法则不注入，避免影响其它请求
    return
  }

  const csp = getRendererCspFor('dev')
  const filter = { urls: [`${origin}/*`] }

  session.defaultSession.webRequest.onHeadersReceived(filter, (details, callback) => {
    const responseHeaders = details.responseHeaders ?? {}

    // 统一覆盖为主进程生成的 CSP（避免下游/插件注入导致策略不一致）
    responseHeaders['Content-Security-Policy'] = [csp]
    responseHeaders['content-security-policy'] = [csp]

    callback({ responseHeaders })
  })
}
