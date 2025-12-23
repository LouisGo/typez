export function ChatsIndexPage() {
  return (
    <div className="flex h-full min-h-0 items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="bg-muted/20 rounded-xl border p-8 text-center">
          <div className="text-base font-semibold">选择一个会话</div>
          <div className="text-muted-foreground mt-2 text-sm">
            这是 UI MVP 占位：左侧切换会话，右侧只渲染对应的内容区域。
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="bg-muted h-16 rounded-lg" />
            <div className="bg-muted h-16 rounded-lg" />
            <div className="bg-muted h-16 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
