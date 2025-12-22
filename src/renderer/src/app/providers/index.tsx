import { QueryProvider } from './query-provider'

/**
 * App Providers
 * 组合所有全局 Provider
 */
export function AppProviders() {
  return (
    <QueryProvider>
      <div className="h-screen w-screen bg-background text-foreground">
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Typey</h1>
            <p className="text-muted-foreground">
              IM Application - Architecture Ready
            </p>
            <p className="text-sm text-muted-foreground">
              Start building your features!
            </p>
          </div>
        </div>
      </div>
    </QueryProvider>
  )
}
