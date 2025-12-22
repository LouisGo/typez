import { createRouter, createRootRoute, createRoute, redirect, Outlet } from '@tanstack/react-router'
import { motion } from 'framer-motion'

import { ChatsPage } from '@renderer/pages/chats/ChatsPage'
import { ChatThreadPage } from '@renderer/pages/chats/ChatThreadPage'
import { AppShell } from '@renderer/app/shell/AppShell'

const rootRoute = createRootRoute({
  component: () => (
    <AppShell>
      <motion.div
        key="route"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="h-full"
      >
        <Outlet />
      </motion.div>
    </AppShell>
  )
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/chats' })
  }
})

const chatsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chats',
  component: ChatsPage
})

const chatThreadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chats/$chatId',
  component: ChatThreadPage
})

const routeTree = rootRoute.addChildren([indexRoute, chatsRoute, chatThreadRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}


