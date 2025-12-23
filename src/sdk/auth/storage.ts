export interface StorageAdapter<T> {
  get(): Promise<T | null>
  set(value: T): Promise<void>
  remove(): Promise<void>
}

export class MemoryStorageAdapter<T> implements StorageAdapter<T> {
  private value: T | null = null

  async get(): Promise<T | null> {
    return this.value
  }

  async set(value: T): Promise<void> {
    this.value = value
  }

  async remove(): Promise<void> {
    this.value = null
  }
}
