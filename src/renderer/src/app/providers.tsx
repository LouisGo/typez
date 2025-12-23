import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'

import { router } from '@renderer/app/router'
import { useAuthStore } from '@renderer/stores'

const queryClient = new QueryClient()

/**
 * 应用启动时初始化认证状态
 */
function AuthInitializer() {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return null
}

export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
