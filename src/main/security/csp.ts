import { is } from '@electron-toolkit/utils'

type CspMode = 'dev' | 'prod'

function buildCsp(mode: CspMode): string {
  // 说明：
  // - CSP 最好由主进程统一注入，避免写死在 renderer HTML 里导致维护成本高
  // - dev 允许 localhost 任意端口（HMR、调试插件等），prod 则只放行应用真正需要的源
  const common = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'"
  ]

  if (mode === 'dev') {
    // dev: 允许本机任意端口，覆盖 Vite HMR(ws)、code-inspector 等调试工具
    return [
      ...common,
      "img-src 'self' data: http://localhost:* http://127.0.0.1:*",
      "connect-src 'self' http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:*"
    ].join('; ')
  }

  // prod: 只允许应用自身与内置 API 服务（当前为 3456）
  return [
    ...common,
    "img-src 'self' data:",
    "connect-src 'self' http://127.0.0.1:3456 http://localhost:3456 ws://127.0.0.1:3456 ws://localhost:3456"
  ].join('; ')
}

export function getRendererCsp(): string {
  return buildCsp(is.dev ? 'dev' : 'prod')
}

export function getRendererCspFor(mode: CspMode): string {
  return buildCsp(mode)
}
