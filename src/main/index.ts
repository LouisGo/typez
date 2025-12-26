import { app } from 'electron'
import { DatabaseService } from './database'
import { setupAppLifecycle } from './lifecycle'
import { installDevTools } from './utils/devtools'
import { createMainWindow } from './windows/main'
import { bootstrapServer } from './server'

// 所有模式都需要数据库（Mock 服务也存储到数据库）
const db = new DatabaseService()

async function bootstrap(): Promise<void> {
  // 1. Install DevTools (Development only)
  await installDevTools()

  // 2. Initialize Core Services (Database)
  // 数据库已在上面初始化，Mock 服务也使用数据库存储

  // 3. Start Fastify Server
  const api = await bootstrapServer({ db })

  // 4. Setup App Lifecycle & Shortcuts
  setupAppLifecycle({
    onQuit: () => {
      api?.close?.()
      db?.close()
    },
    onActivate: () => createMainWindow()
  })

  createMainWindow()
}

// Start application
app.whenReady().then(bootstrap)
