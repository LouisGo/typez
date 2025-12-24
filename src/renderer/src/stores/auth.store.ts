import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '@infra/api'
import type { User } from '@sdk/contract/models'

/**
 * 认证状态管理
 * 管理用户登录状态和认证相关的 UI 状态
 * 使用 localStorage 持久化登录状态
 */
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  isInitialized: boolean

  // Actions
  login: (username: string, password: string) => Promise<void>
  register: (username: string, displayName: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setAuth: (user: User) => void
  setError: (error: string | null) => void
  clearError: () => void
  initialize: () => Promise<void>
}

const STORAGE_KEY = 'auth-storage'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isInitialized: false,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          // 调用 API，类型自动推导为 Promise<User>
          const user = await authAPI.login(username, password)
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '登录失败'
          set({
            error: errorMessage,
            isLoading: false
          })
          throw error
        }
      },

      register: async (username: string, displayName: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          // 调用 API，类型自动推导为 Promise<User>
          const user = await authAPI.register(username, displayName, password)
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '注册失败'
          set({
            error: errorMessage,
            isLoading: false
          })
          throw error
        }
      },

      logout: async () => {
        const { user } = get()
        if (user) {
          try {
            await authAPI.logout(user.id)
          } catch (error) {
            console.error('Logout failed:', error)
          }
        }
        set({ user: null, isAuthenticated: false })
      },

      setAuth: (user: User) => set({ user, isAuthenticated: true }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      initialize: async () => {
        const { user } = get()
        if (user?.id) {
          try {
            // 验证用户是否仍然有效
            const currentUser = await authAPI.getCurrentUser()
            if (currentUser) {
              set({ user: currentUser, isAuthenticated: true, isInitialized: true })
            } else {
              // 用户不存在，清除登录状态
              set({ user: null, isAuthenticated: false, isInitialized: true })
            }
          } catch (error) {
            console.error('初始化用户状态失败:', error)
            // 初始化失败，清除登录状态
            set({ user: null, isAuthenticated: false, isInitialized: true })
          }
        } else {
          set({ isInitialized: true })
        }
      }
    }),
    {
      name: STORAGE_KEY,
      // 只持久化用户信息，不持久化 loading 和 error 状态
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
