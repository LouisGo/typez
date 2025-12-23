import type { StorageAdapter } from '@sdk/auth/storage'

/**
 * 浏览器 localStorage 适配器（框架无关）
 * - 仅用于 renderer（有 DOM）
 */
export function createLocalStorageAdapter<T>(key: string): StorageAdapter<T> {
  return {
    async get() {
      const raw = localStorage.getItem(key)
      if (!raw) return null
      try {
        return JSON.parse(raw) as T
      } catch {
        return null
      }
    },
    async set(value) {
      localStorage.setItem(key, JSON.stringify(value))
    },
    async remove() {
      localStorage.removeItem(key)
    }
  }
}
