import type { User } from '@shared/types/models'
import type { StorageAdapter } from './storage'

export type AuthSession = {
  user: User
}

export type AuthListener = (session: AuthSession | null) => void

export class AuthManager {
  private listeners = new Set<AuthListener>()
  private session: AuthSession | null = null

  constructor(private storage: StorageAdapter<AuthSession>) {}

  async init(): Promise<void> {
    this.session = await this.storage.get()
    this.emit()
  }

  getSession(): AuthSession | null {
    return this.session
  }

  getUser(): User | null {
    return this.session?.user ?? null
  }

  async setSession(session: AuthSession | null): Promise<void> {
    this.session = session
    if (session) await this.storage.set(session)
    else await this.storage.remove()
    this.emit()
  }

  subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private emit() {
    for (const l of this.listeners) l(this.session)
  }
}
