import { createRouter, createRootRoute, createRoute, redirect, Outlet } from '@tanstack/react-router'

import { AppShell } from '@renderer/app/shell/AppShell'
import { AuthLayout } from '@renderer/app/layouts/AuthLayout'
import { LoginPage } from '@renderer/pages/auth/LoginPage'
import { RegisterPage } from '@renderer/pages/auth/RegisterPage'
import { ChatsPage } from '@renderer/pages/chats/ChatsPage'
import { ChatsIndexPage } from '@renderer/pages/chats/ChatsIndexPage'
import { ChatThreadPage } from '@renderer/pages/chats/ChatThreadPage'
import { ContactsPage } from '@renderer/pages/contacts/ContactsPage'
import { SettingsPage } from '@renderer/pages/settings/SettingsPage'

const rootRoute = createRootRoute({
  component: () => <Outlet />
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/auth/login' })
  },
})

const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'auth',
  component: AuthLayout,
})

const loginRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: 'login',
  component: LoginPage,
})

const registerRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: 'register',
  component: RegisterPage,
})

const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'app',
  component: AppShell,
})

const chatsLayoutRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'chats',
  component: ChatsPage,
})

const chatsIndexRoute = createRoute({
  getParentRoute: () => chatsLayoutRoute,
  path: '/',
  component: ChatsIndexPage,
})

const chatThreadRoute = createRoute({
  getParentRoute: () => chatsLayoutRoute,
  path: '$chatId',
  component: ChatThreadPage,
})

const contactsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'contacts',
  component: ContactsPage,
})

const settingsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: 'settings',
  component: SettingsPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  authLayoutRoute.addChildren([loginRoute, registerRoute]),
  appLayoutRoute.addChildren([
    chatsLayoutRoute.addChildren([chatsIndexRoute, chatThreadRoute]),
    contactsRoute,
    settingsRoute,
  ]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}


