import { protocol } from 'electron'
import { readFile } from 'fs/promises'
import { extname, resolve } from 'path'

import { getRendererCspFor } from './csp'

/**
 * 必须在 app ready 之前调用：让 `app://` 作为安全/标准协议工作（支持相对路径、Fetch 等）。
 */
export function registerAppSchemePrivileges(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'app',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
        stream: true
      }
    }
  ])
}

function contentTypeFor(pathname: string): string | undefined {
  switch (extname(pathname).toLowerCase()) {
    case '.html':
      return 'text/html; charset=utf-8'
    case '.js':
      return 'text/javascript; charset=utf-8'
    case '.css':
      return 'text/css; charset=utf-8'
    case '.json':
      return 'application/json; charset=utf-8'
    case '.svg':
      return 'image/svg+xml'
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.webp':
      return 'image/webp'
    case '.gif':
      return 'image/gif'
    case '.ico':
      return 'image/x-icon'
    case '.woff2':
      return 'font/woff2'
    case '.woff':
      return 'font/woff'
    case '.ttf':
      return 'font/ttf'
    default:
      return undefined
  }
}

function getRendererRootDir(): string {
  // electron-vite 默认会把 renderer 产物放在与 main 同级的 `renderer` 目录下
  return resolve(__dirname, '../renderer')
}

function isHtmlPath(pathname: string): boolean {
  return pathname === '/' || pathname.toLowerCase().endsWith('.html')
}

/**
 * 注册 `app://` 协议，把生产环境 renderer 静态资源以带 Header 的方式提供出来（用于注入 CSP）。
 * 需要在 app ready 之后调用。
 */
export function registerAppProtocol(): void {
  protocol.handle('app', async (request) => {
    const url = new URL(request.url)
    let pathname = decodeURIComponent(url.pathname || '/')
    if (pathname === '/') pathname = '/index.html'

    const root = getRendererRootDir()
    const abs = resolve(root, '.' + pathname)

    // 防止路径穿越
    if (!abs.startsWith(root)) {
      return new Response('Bad Request', { status: 400 })
    }

    try {
      const data = await readFile(abs)

      const headers = new Headers()
      const ct = contentTypeFor(pathname)
      if (ct) headers.set('Content-Type', ct)
      headers.set('Cache-Control', 'no-store')

      // 仅对主文档注入 CSP（资源文件无需）
      if (isHtmlPath(pathname)) {
        headers.set('Content-Security-Policy', getRendererCspFor('prod'))
      }

      return new Response(data, { status: 200, headers })
    } catch {
      return new Response('Not Found', { status: 404 })
    }
  })
}
