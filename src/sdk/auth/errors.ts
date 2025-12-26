// ============================================
// Authentication Error Types
// ============================================

/**
 * 认证错误代码
 */
export enum AuthErrorCode {
  /** 用户不存在 */
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  /** 密码错误 */
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  /** 用户名已存在 */
  USERNAME_ALREADY_EXISTS = 'USERNAME_ALREADY_EXISTS',
  /** 用户名格式无效 */
  INVALID_USERNAME = 'INVALID_USERNAME',
  /** 密码格式无效 */
  INVALID_PASSWORD_FORMAT = 'INVALID_PASSWORD_FORMAT',
  /** 显示名称格式无效 */
  INVALID_DISPLAY_NAME = 'INVALID_DISPLAY_NAME',
  /** 未登录/会话无效 */
  NOT_LOGGED_IN = 'NOT_LOGGED_IN',
  /** 未知错误 */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * 认证错误类
 */
export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    message: string
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

/**
 * 创建认证错误
 */
export const createAuthError = {
  userNotFound: () => new AuthError(AuthErrorCode.USER_NOT_FOUND, '用户不存在，请先注册'),
  invalidPassword: () => new AuthError(AuthErrorCode.INVALID_PASSWORD, '密码错误'),
  usernameAlreadyExists: () => new AuthError(AuthErrorCode.USERNAME_ALREADY_EXISTS, '用户名已存在'),
  invalidUsername: (message?: string) =>
    new AuthError(AuthErrorCode.INVALID_USERNAME, message || '用户名格式无效'),
  invalidPasswordFormat: (message?: string) =>
    new AuthError(AuthErrorCode.INVALID_PASSWORD_FORMAT, message || '密码格式无效'),
  invalidDisplayName: (message?: string) =>
    new AuthError(AuthErrorCode.INVALID_DISPLAY_NAME, message || '显示名称格式无效'),
  notLoggedIn: (message?: string) =>
    new AuthError(AuthErrorCode.NOT_LOGGED_IN, message || '请先登录'),
  unknown: (message?: string) => new AuthError(AuthErrorCode.UNKNOWN_ERROR, message || '未知错误')
}
