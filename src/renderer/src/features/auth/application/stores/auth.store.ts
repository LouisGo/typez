import { create } from 'zustand'
import type { User } from '../../domain/entities'
import { mockAuthDataSource } from '../../data/sources/auth.mock'
import type { LoginCredentials, RegisterData } from '../../domain/types'

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
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null })
    try {
      const user = await mockAuthDataSource.login(credentials)
      set({ user, isAuthenticated: true, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const user = await mockAuthDataSource.register(data)
      set({ user, isAuthenticated: true, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await mockAuthDataSource.logout()
      set({ user: null, isAuthenticated: false, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  checkAuth: async () => {
    try {
      const user = await mockAuthDataSource.getCurrentUser()
      set({ user, isAuthenticated: !!user })
    } catch (error) {
      set({ user: null, isAuthenticated: false })
    }
  },
}))
