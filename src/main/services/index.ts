import { DatabaseService } from '../database'
import { AuthService } from './auth.service'
import { ChatService } from './chat.service'
import { MockAuthService } from '../mock/services/auth.mock.service'
import { MockChatService } from '../mock/services/chat.mock.service'
import type { IAuthService } from './auth.service.interface'
import type { IChatService } from './chat.service.interface'

// 环境检测
const isDevelopment = process.env.NODE_ENV === 'development'
const useMock = process.env.USE_MOCK === 'true' || isDevelopment

console.log(`[Services] 环境模式: ${isDevelopment ? '开发' : '生产'}, 使用 Mock: ${useMock}`)

// 初始化数据库 (仅生产环境需要)
let db: DatabaseService | null = null
if (!useMock) {
  db = new DatabaseService()
}

// 导出服务实例
export const authService: IAuthService = useMock ? new MockAuthService() : new AuthService(db!)

export const chatService: IChatService = useMock ? new MockChatService() : new ChatService(db!)
