import { app, BrowserWindow, screen } from 'electron'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

interface WindowState {
  width: number
  height: number
  x?: number
  y?: number
  isMaximized?: boolean
  isFullScreen?: boolean
}

const DEFAULT_WIDTH = 900
const DEFAULT_HEIGHT = 670

/**
 * 获取窗口状态文件路径
 */
function getStateFilePath(): string {
  const userDataPath = app.getPath('userData')
  return join(userDataPath, 'window-state.json')
}

/**
 * 读取保存的窗口状态
 */
function loadWindowState(): WindowState | null {
  const stateFilePath = getStateFilePath()

  if (!existsSync(stateFilePath)) {
    return null
  }

  try {
    const data = readFileSync(stateFilePath, 'utf-8')
    const state = JSON.parse(data) as WindowState

    // 验证状态有效性
    if (state.width && state.height && state.width > 0 && state.height > 0) {
      return state
    }
  } catch (error) {
    console.error('Failed to load window state:', error)
  }

  return null
}

/**
 * 保存窗口状态
 */
function saveWindowState(window: BrowserWindow): void {
  try {
    const bounds = window.getBounds()
    const isMaximized = window.isMaximized()
    const isFullScreen = window.isFullScreen()

    const state: WindowState = {
      width: bounds.width,
      height: bounds.height,
      isMaximized,
      isFullScreen,
    }

    // 只有在窗口不是最大化或全屏时才保存位置
    // 因为最大化/全屏时位置信息不准确
    if (!isMaximized && !isFullScreen) {
      state.x = bounds.x
      state.y = bounds.y
    } else {
      // 如果当前是最大化/全屏，保留之前的位置
      const savedState = loadWindowState()
      if (savedState?.x !== undefined && savedState?.y !== undefined) {
        state.x = savedState.x
        state.y = savedState.y
      }
    }

    const stateFilePath = getStateFilePath()
    writeFileSync(stateFilePath, JSON.stringify(state, null, 2), 'utf-8')
  } catch (error) {
    console.error('Failed to save window state:', error)
  }
}

/**
 * 检查窗口位置是否在可见区域内
 * 处理多显示器场景，防止窗口出现在已断开的外部显示器上
 */
function ensureWindowIsVisible(state: WindowState): WindowState {
  const displays = screen.getAllDisplays()

  // 如果没有保存位置，返回默认状态
  if (state.x === undefined || state.y === undefined) {
    return state
  }

  // 检查窗口是否在任何显示器的可见区域内
  const isVisible = displays.some(display => {
    const { x, y, width, height } = display.bounds
    return (
      state.x! >= x &&
      state.x! < x + width &&
      state.y! >= y &&
      state.y! < y + height
    )
  })

  // 如果窗口不在可见区域内，使用主显示器的中心位置
  if (!isVisible) {
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize
    const { x: screenX, y: screenY } = primaryDisplay.workArea

    state.x = screenX + (screenWidth - state.width) / 2
    state.y = screenY + (screenHeight - state.height) / 2
  }

  return state
}

/**
 * 获取窗口创建选项，包含保存的位置和大小
 */
export function getWindowOptions(): Electron.BrowserWindowConstructorOptions {
  const savedState = loadWindowState()

  if (!savedState) {
    // 如果没有保存的状态，使用默认值并居中显示
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize
    const { x: screenX, y: screenY } = primaryDisplay.workArea

    return {
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      x: screenX + (screenWidth - DEFAULT_WIDTH) / 2,
      y: screenY + (screenHeight - DEFAULT_HEIGHT) / 2,
    }
  }

  // 确保窗口在可见区域内
  const safeState = ensureWindowIsVisible(savedState)

  const options: Electron.BrowserWindowConstructorOptions = {
    width: safeState.width,
    height: safeState.height,
  }

  // 只有在有位置信息且不是最大化时才设置位置
  if (safeState.x !== undefined && safeState.y !== undefined && !safeState.isMaximized) {
    options.x = safeState.x
    options.y = safeState.y
  }

  return options
}

/**
 * 设置窗口状态监听器，自动保存窗口状态
 */
export function setupWindowStateListeners(window: BrowserWindow): void {
  let saveTimeout: NodeJS.Timeout | null = null

  // 防抖保存，避免频繁写入文件
  const debouncedSave = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    saveTimeout = setTimeout(() => {
      saveWindowState(window)
    }, 500)
  }

  // 监听窗口移动和调整大小
  window.on('moved', debouncedSave)
  window.on('resized', debouncedSave)

  // 监听最大化/最小化状态变化
  window.on('maximize', () => {
    saveWindowState(window)
  })

  window.on('unmaximize', () => {
    saveWindowState(window)
  })

  window.on('enter-full-screen', () => {
    saveWindowState(window)
  })

  window.on('leave-full-screen', () => {
    saveWindowState(window)
  })

  // 窗口关闭时立即保存
  window.on('close', () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
      saveTimeout = null
    }
    saveWindowState(window)
  })

  // 如果之前是最大化状态，恢复后自动最大化
  const savedState = loadWindowState()
  if (savedState?.isMaximized) {
    // 延迟执行，确保窗口已完全创建
    setTimeout(() => {
      if (!window.isDestroyed()) {
        window.maximize()
      }
    }, 100)
  }
}

