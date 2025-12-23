import { create } from 'zustand'
import { User } from '../domain/entities/user.entity'
import { authAPI } from '@infra/api'
import type { LoginCredentials, RegisterData } from '../domain/types'

/**
 * Auth Store State
 */
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

/**
 * Auth Store - Zustand
 * 管理认证状态
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null })
    try {
      const userTable = await authAPI.login(credentials.username, credentials.password)
      const user = User.fromTable(userTable)
      set({ user, isAuthenticated: true, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const userTable = await authAPI.register(data.username, data.displayName, data.password)
      const user = User.fromTable(userTable)
      set({ user, isAuthenticated: true, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  logout: async () => {
    const { user } = get()
    if (!user) return

    set({ isLoading: true })
    try {
      await authAPI.logout(user.id)
      set({ user: null, isAuthenticated: false, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  checkAuth: async () => {
    // 这里可以根据本地存储的 userId 检查，或者直接获取
    // 简化处理：暂时不传 userId，让 Main 进程根据会话决定或返回 null
    try {
      // 实际上 getCurrentUser 可能还需要一个 userId 或者从 session 获取
      // 这里为了兼容之前的逻辑，我们假设不需要传参数（或者从 localStorage 取）
      const userId = 'current' // 示例占位符
      const userTable = await authAPI.getCurrentUser(userId)
      const user = userTable ? User.fromTable(userTable) : null
      set({ user, isAuthenticated: !!user })
    } catch (error) {
      set({ user: null, isAuthenticated: false })
    }
  }
}))
