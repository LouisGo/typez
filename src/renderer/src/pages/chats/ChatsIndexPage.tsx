import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from '@components/ui/empty'
import { Skeleton } from '@components/ui/skeleton'

export function ChatsIndexPage() {
  return (
    <div className="flex h-full min-h-0 items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <Empty className="bg-muted/10">
          <EmptyHeader>
            <EmptyTitle>选择一个会话</EmptyTitle>
            <EmptyDescription>
              这是 UI MVP 占位：左侧切换会话，右侧只渲染对应的内容区域。
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="max-w-md">
            <div className="grid w-full grid-cols-3 gap-3">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
          </EmptyContent>
        </Empty>
      </div>
    </div>
  )
}
