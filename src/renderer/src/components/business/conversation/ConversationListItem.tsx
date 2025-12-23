import * as React from 'react'
import { Link, type LinkProps } from '@tanstack/react-router'

import { Avatar, AvatarFallback } from '@components/ui/avatar'
import { Badge } from '@components/ui/badge'
import { Button } from '@components/ui/button'
import { cn } from '@/shared/utils'

export type ConversationId = string

export interface ConversationListItemData {
  id: ConversationId
  title: string
  lastMessage?: string
  time?: string
  /**
   * 未读数量（0/undefined 表示不展示）
   */
  unreadCount?: number
  /**
   * 头像占位（优先使用该字符；为空则从 title 取首字母）
   */
  avatarFallback?: string
}

export interface ConversationListItemProps {
  /**
   * 会话数据（建议保持引用稳定，减少重渲染）
   */
  conversation: ConversationListItemData
  /**
   * 跳转地址（TanStack Router）
   */
  to: LinkProps['to']
  /**
   * 路由参数（例如 chatId）
   */
  params?: LinkProps['params']
  /**
   * 额外类名（挂在按钮根节点，即 Link）
   */
  className?: string
  /**
   * 自定义激活/非激活样式（会追加在默认样式后）
   */
  activeClassName?: string
  inactiveClassName?: string
  /**
   * 是否展示未读角标（默认 true）
   */
  showUnread?: boolean
}

function getFallbackText(conversation: ConversationListItemData) {
  const t = conversation.avatarFallback?.trim()
  if (t) return t.slice(0, 1)
  return conversation.title.trim().slice(0, 1) || '?'
}

function formatUnread(count: number) {
  if (count <= 0) return null
  if (count > 99) return '99+'
  return String(count)
}

export const ConversationListItem = React.memo(
  ({
    conversation,
    to,
    params,
    className,
    activeClassName,
    inactiveClassName,
    showUnread = true
  }: ConversationListItemProps) => {
    const unreadLabel = showUnread ? formatUnread(conversation.unreadCount ?? 0) : null

    return (
      <Button
        variant="ghost"
        className={cn('h-auto w-full justify-start rounded-lg px-3 py-2', className)}
        asChild
      >
        <Link
          to={to}
          params={params}
          activeProps={{
            className: cn(
              "text-accent-foreground bg-accent/80 before:bg-primary ring-ring/20 relative ring-1 before:absolute before:top-2 before:bottom-2 before:left-1 before:w-1 before:rounded-full before:content-['']",
              activeClassName
            )
          }}
          inactiveProps={{
            className: cn('hover:bg-accent/50', inactiveClassName)
          }}
          aria-label={`打开会话：${conversation.title}`}
        >
          <div className="flex w-full items-center gap-3">
            <Avatar className="h-9 w-9 shrink-0 border border-amber-300">
              <AvatarFallback className="bg-muted text-amber-300">
                {getFallbackText(conversation)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <div className="truncate text-sm font-medium">{conversation.title}</div>
                <div className="text-muted-foreground shrink-0 text-xs">
                  {conversation.time ?? ''}
                </div>
              </div>
              <div className="text-muted-foreground flex min-w-0 items-center justify-between gap-2">
                <div className="truncate text-xs">{conversation.lastMessage ?? ''}</div>
                {unreadLabel ? (
                  <Badge variant="secondary" className="h-5 shrink-0 rounded-full px-2 text-[11px]">
                    {unreadLabel}
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>
        </Link>
      </Button>
    )
  }
)

ConversationListItem.displayName = 'ConversationListItem'
