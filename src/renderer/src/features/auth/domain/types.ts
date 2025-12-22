/**
 * Auth Domain Types
 */

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  password: string
  displayName: string
}
