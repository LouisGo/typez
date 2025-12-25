import { Outlet } from '@tanstack/react-router'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-background text-foreground">
      <Outlet />
    </div>
  )
}
