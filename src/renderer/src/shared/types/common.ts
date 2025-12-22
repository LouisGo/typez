/**
 * Common TypeScript types
 */

export type Nullable<T> = T | null

export type Optional<T> = T | undefined

export type ID = string

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginationResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  code?: string
  details?: unknown
}
