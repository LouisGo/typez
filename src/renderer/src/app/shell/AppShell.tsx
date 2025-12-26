import { Link, Outlet, LinkProps } from '@tanstack/react-router'
import { motion } from 'framer-motion'

import { Button } from '@components/ui/button'
import { useAuthStore } from '@/stores'
import { ModeToggle } from '@/components/theme/ModeToggle'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

type NavItem = {
  to: LinkProps['to']
  label: string
}

const navItems: NavItem[] = [
  { to: '/chats', label: '聊天' },
  { to: '/contacts', label: '联系人' },
  { to: '/settings', label: '设置' }
]

export function AppShell() {
  const user = useAuthStore((store) => store.user)
  const logout = useAuthStore((store) => store.logout)
  return (
    <div className="h-screen w-screen bg-background text-foreground">
      <div className="mx-auto flex h-full max-w-6xl flex-col">
        <header className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-blue-300">
              <AvatarFallback className="bg-muted text-blue-300">
                {user?.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="leading-tight">
              <div className="text-sm font-semibold">{user?.username}</div>
              <div className="text-xs text-muted-foreground">we will fuck typex soon</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-2">
              {navItems.map((item) => (
                <Button key={item.to} variant="outline" size="sm" asChild>
                  <Link to={item.to}>{item.label}</Link>
                </Button>
              ))}
            </nav>
            <ModeToggle />
            <Button variant="ghost" size="sm" asChild>
              <button onClick={() => logout()}>退出登录</button>
            </Button>
          </div>
        </header>
        <main className="min-h-0 flex-1">
          <motion.div
            key="route"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
