import { Outlet } from '@tanstack/react-router'

export function AuthLayout() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-10">
        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
