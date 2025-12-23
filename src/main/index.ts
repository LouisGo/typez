import { app, ipcMain } from 'electron'
import { DatabaseService } from './database'
import { setupIPC } from './ipc'
import { setupAppLifecycle } from './lifecycle'
import { installDevTools } from './utils/devtools'
import { createMainWindow } from './windows/main'

// Initialization configuration
const isDevelopment = process.env.NODE_ENV === 'development'
const useMock = process.env.USE_MOCK === 'true' || isDevelopment
let db: DatabaseService | null = null

async function bootstrap(): Promise<void> {
  // 1. Install DevTools (Development only)
  await installDevTools()

  // 2. Initialize Core Services (Database)
  if (!useMock) {
    db = new DatabaseService()
  }

  // 3. Setup IPC Handlers
  setupIPC(db || undefined)
  ipcMain.on('ping', () => console.log('pong'))

  // 4. Setup App Lifecycle & Shortcuts
  setupAppLifecycle({
    onQuit: () => db?.close(),
    onActivate: () => createMainWindow()
  })

  // 5. Create Main Window
  // Small delay to ensure DevTools are fully ready if needed
  if (isDevelopment) {
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  
  createMainWindow()
}

// Start application
app.whenReady().then(bootstrap)
