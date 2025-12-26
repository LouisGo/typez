import { AuthManager, createHttpRendererTransport, createTypezClient } from '@sdk'
import { createLocalStorageAdapter } from './storage'
import type { AuthSession } from '@sdk/auth/auth-manager'

const AUTH_STORAGE_KEY = 'typez:auth-session'

export const authManager = new AuthManager(createLocalStorageAdapter<AuthSession>(AUTH_STORAGE_KEY))

// 初始化读取持久化 session（不阻塞模块加载）
void authManager.init()

export const typezClient = createTypezClient({
  transport: createHttpRendererTransport({ baseUrl: 'http://127.0.0.1:3456' }),
  auth: authManager
})
