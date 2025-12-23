import {
  createRouter,
  createRootRoute,
  createRoute,
  redirect,
  Outlet
} from '@tanstack/react-router'

import { AppShell } from '@renderer/app/shell/AppShell'
import { AuthLayout } from '@renderer/app/layouts/AuthLayout'
import { LoginPage } from '@renderer/pages/auth/LoginPage'
import { RegisterPage } from '@renderer/pages/auth/RegisterPage'
import { ChatsPage } from '@renderer/pages/chats/ChatsPage'
import { ChatsIndexPage } from '@renderer/pages/chats/ChatsIndexPage'
import { ChatThreadPage } from '@renderer/pages/chats/ChatThreadPage'
import { ContactsPage } from '@renderer/pages/contacts/ContactsPage'
import { SettingsPage } from '@renderer/pages/settings/SettingsPage'
import { useAuthStore } from '@renderer/stores'

/**
 * 检查认证状态的工具函数
 */
async function checkAuth(): Promise<boolean> {
  const state = useAuthStore.getState()

  // 如果还未初始化，先初始化
  if (!state.isInitialized) {
    await state.initialize()
  }

  return useAuthStore.getState().isAuthenticated
}

const rootRoute = createRootRoute({
  component: () => <Outlet />
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: async () => {
    const isAuth = await checkAuth()
    if (isAuth) {
      throw redirect({ to: '/chats' })
    } else {
      throw redirect({ to: '/auth/login' })
    }
  }
})

const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'auth',
  component: AuthLayout,
  beforeLoad: async () => {
    // 如果已登录，重定向到应用首页
    const isAuth = await checkAuth()
    if (isAuth) {
      throw redirect({ to: '/chats' })
    }
  }
})

const loginRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: 'login',
  component: LoginPage
})

const registerRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: 'register',
  component: RegisterPage
})

const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'app',
  component: AppShell,
  beforeLoad: async () => {
    // 路由守卫：未登录用户重定向到登录页
    const isAuth = await checkAuth()
    if (!isAuth) {
      throw redirect({ to: '/auth/login' })
    }
  }
})

const chatsLayoutRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'chats',
  component: ChatsPage
})

const chatsIndexRoute = createRoute({
  getParentRoute: () => chatsLayoutRoute,
  path: '/',
  component: ChatsIndexPage
})

const chatThreadRoute = createRoute({
  getParentRoute: () => chatsLayoutRoute,
  path: '$chatId',
  component: ChatThreadPage
})

const contactsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'contacts',
  component: ContactsPage
})

const settingsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'settings',
  component: SettingsPage
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  authLayoutRoute.addChildren([loginRoute, registerRoute]),
  appLayoutRoute.addChildren([
    chatsLayoutRoute.addChildren([chatsIndexRoute, chatThreadRoute]),
    contactsRoute,
    settingsRoute
  ])
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
