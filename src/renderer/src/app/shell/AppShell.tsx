import { Link, Outlet, LinkProps } from '@tanstack/react-router'
import { motion } from 'framer-motion'

import { Button } from '@components/ui/button'

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
  return (
    <div className="bg-background text-foreground h-screen w-screen">
      <div className="mx-auto flex h-full max-w-6xl flex-col">
        <header className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full border border-red-300 text-red-300">
              X
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">typez</div>
              <div className="text-muted-foreground text-xs">we will fuck typex soon</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-2">
              {navItems.map((item) => (
                <Button key={item.to} variant="secondary" size="sm" asChild>
                  <Link to={item.to}>{item.label}</Link>
                </Button>
              ))}
            </nav>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth/login">登录</Link>
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
