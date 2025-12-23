# 开发指南：登录功能完整开发路径

## 📋 当前状态检查

### ✅ 已完成的部分

1. **类型定义** (`src/shared/types/`)
   - ✅ `models.ts` - User 领域模型（camelCase）
   - ✅ `ipc.ts` - IPC 协议定义（`auth:login`）

2. **Main 进程** (`src/main/`)
   - ✅ `services/auth.service.ts` - 业务逻辑（密码验证待实现）
   - ✅ `ipc/auth.handler.ts` - IPC Handler
   - ✅ `utils/transformers.ts` - 数据转换工具

3. **Preload** (`src/preload/`)
   - ✅ `index.ts` - 暴露类型安全的 API

4. **Renderer API** (`src/renderer/src/infra/api/`)
   - ✅ `auth.api.ts` - API 客户端封装

5. **UI 层** (`src/renderer/src/pages/auth/`)
   - ⚠️ `LoginPage.tsx` - 只有 UI 结构，缺少功能实现

### ❌ 缺失的部分

1. **认证状态管理** - 需要创建 Zustand store
2. **LoginPage 功能实现** - 表单处理和 API 调用
3. **密码验证** - Main 进程的密码验证逻辑（可选，当前跳过）

---

## 🚀 开发路径（类型优先）

### 第一步：完善类型定义（如果需要）

**文件**: `src/shared/types/models.ts` 或 `src/shared/types/ipc.ts`

如果登录需要额外的类型（如错误类型、登录响应类型），先定义：

```typescript
// src/shared/types/models.ts (如果还没有)
export interface LoginError {
  code: 'USER_NOT_FOUND' | 'INVALID_PASSWORD' | 'NETWORK_ERROR'
  message: string
}
```

**当前状态**: ✅ 基本类型已定义，可以跳过

---

### 第二步：完善 Main 进程业务逻辑（可选）

**文件**: `src/main/services/auth.service.ts`

如果需要实现密码验证：

```typescript
import bcrypt from 'bcrypt'

async login(username: string, password: string): Promise<User> {
  // ... 查询用户

  // 验证密码
  if (!bcrypt.compareSync(password, userTable.password_hash)) {
    throw new Error('密码错误')
  }

  // ... 更新状态
}
```

**当前状态**: ⚠️ 密码验证已注释，可以暂时跳过

---

### 第三步：创建认证状态管理（Renderer）

**文件**: `src/renderer/src/stores/auth.store.ts` (新建)

```typescript
import { create } from 'zustand'
import { authAPI } from '@infra/api'
import type { User } from '@shared/types/models'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const user = await authAPI.login(username, password)
      set({ user, isAuthenticated: true, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '登录失败',
        isLoading: false
      })
      throw error
    }
  },

  logout: async () => {
    const { user } = useAuthStore.getState()
    if (user) {
      await authAPI.logout(user.id)
    }
    set({ user: null, isAuthenticated: false })
  },

  clearError: () => set({ error: null })
}))
```

**关键点**:

- ✅ 使用 `authAPI.login()` - 类型自动推导
- ✅ 直接使用 `User` 类型（camelCase）
- ✅ 无需数据转换（Main 进程已处理）

---

### 第四步：实现 LoginPage 功能

**文件**: `src/renderer/src/pages/auth/LoginPage.tsx`

```typescript
import { useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { useAuthStore } from '@renderer/stores/auth.store'
import { Button } from '@components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@components/ui/card'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Separator } from '@components/ui/separator'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      await login(username, password)
      // 登录成功，跳转到应用首页
      navigate({ to: '/chats' })
    } catch (error) {
      // 错误已在 store 中处理
      console.error('Login failed:', error)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">登录</CardTitle>
        <CardDescription>使用账号密码进入 Typez</CardDescription>
      </CardHeader>

      <Separator />

      <CardContent className="space-y-4 pt-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="login-username">用户名</Label>
            <Input
              id="login-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              autoComplete="username"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">密码</Label>
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              autoComplete="current-password"
              required
              disabled={isLoading}
            />
          </div>

          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? '登录中...' : '登录'}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-between gap-3">
        <div className="flex items-center justify-between text-sm">
          <Button variant="link" className="px-0" asChild>
            <Link to="/auth/register">去注册</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/chats">跳过登录进入应用</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
```

**关键点**:

- ✅ 使用 `useAuthStore()` - 状态管理
- ✅ 调用 `authAPI.login()` - 类型安全
- ✅ 错误处理和加载状态
- ✅ 表单验证

---

### 第五步：添加路由保护（可选）

**文件**: `src/renderer/src/app/router.tsx`

如果需要保护需要登录的路由：

```typescript
import { useAuthStore } from '@renderer/stores/auth.store'

const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'app',
  component: AppShell,
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      throw redirect({ to: '/auth/login' })
    }
  }
})
```

---

## 📝 完整开发路径总结

```
1. 类型定义 (src/shared/types/)
   └─ models.ts, ipc.ts
   ✅ 已完成

2. Main 进程业务逻辑 (src/main/services/)
   └─ auth.service.ts
   ✅ 已完成（密码验证可选）

3. Main 进程 IPC Handler (src/main/ipc/)
   └─ auth.handler.ts
   ✅ 已完成

4. Preload 暴露 API (src/preload/)
   └─ index.ts
   ✅ 已完成

5. Renderer API 客户端 (src/renderer/src/infra/api/)
   └─ auth.api.ts
   ✅ 已完成

6. Renderer 状态管理 (src/renderer/src/stores/) ⚠️ 需要创建
   └─ auth.store.ts
   📝 第三步

7. Renderer UI 实现 (src/renderer/src/pages/auth/)
   └─ LoginPage.tsx
   📝 第四步

8. 路由保护 (src/renderer/src/app/)
   └─ router.tsx
   📝 第五步（可选）
```

---

## 🎯 关键原则

### 1. 类型优先

- 所有类型定义在 `src/shared/types/`
- IPC 通信完全类型安全
- API 调用自动类型推导

### 2. 职责分明

- **Main 进程**: 业务逻辑、数据转换、数据库操作
- **Renderer 进程**: UI 展示、状态管理、API 调用

### 3. 数据流

```
用户输入 (UI)
  ↓
状态管理 (Zustand Store)
  ↓
API 调用 (authAPI.login)
  ↓
IPC (类型安全)
  ↓
Main 进程 (业务逻辑)
  ↓
数据库 (SQLite)
  ↓
数据转换 (snake_case → camelCase)
  ↓
返回领域模型 (User)
  ↓
Renderer 直接使用
```

---

## ✅ 检查清单

开发完成后，确保：

- [ ] 类型定义完整
- [ ] Main 进程业务逻辑正确
- [ ] IPC Handler 已注册
- [ ] Preload API 已暴露
- [ ] Renderer API 客户端可用
- [ ] 状态管理 Store 已创建
- [ ] LoginPage 功能完整
- [ ] 错误处理完善
- [ ] 加载状态显示
- [ ] 路由保护（如需要）

---

## 🚨 常见问题

### Q: 为什么不需要在 Renderer 中转换数据？

A: Main 进程已经完成了数据转换（snake_case → camelCase），Renderer 直接使用返回的 `User` 类型即可。

### Q: 如何确保类型安全？

A: 所有 IPC 通信通过 `IPCChannels` 定义，TypeScript 会在编译时检查类型。

### Q: 状态管理是必须的吗？

A: 不是必须的，但推荐使用 Zustand 管理认证状态，便于在多个组件间共享。

---

**最后更新**: 2025-01-XX
