import { BrowserWindow, shell } from 'electron'
import { join } from 'path'
import icon from '../../../resources/icon.png?asset'
import { getWindowOptions, setupWindowStateListeners } from '../utils/window-state'
import { installDevRendererCspHeaders } from '../security/csp-headers'

export function createMainWindow(): void {
  // 获取保存的窗口状态（位置和大小）
  const windowOptions = getWindowOptions()

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    ...windowOptions,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // 设置窗口状态监听器，自动保存窗口位置和大小
  setupWindowStateListeners(mainWindow)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  const rendererUrl = process.env['ELECTRON_RENDERER_URL']
  if (rendererUrl) {
    // dev / preview: renderer 由本地 HTTP server 提供
    installDevRendererCspHeaders(rendererUrl)
    mainWindow.loadURL(rendererUrl)

    // Open DevTools after page load
    mainWindow.webContents.on('did-finish-load', () => {
      setTimeout(() => {
        mainWindow.webContents.openDevTools()
      }, 500)
    })
  } else {
    // production: 使用 app:// 协议承载 renderer 主文档，从而可由主进程注入 CSP header
    // 注意：registerAppProtocol() 在 app ready 后已注册
    mainWindow.loadURL('app://-/index.html')
    mainWindow.webContents.openDevTools()
  }
}
