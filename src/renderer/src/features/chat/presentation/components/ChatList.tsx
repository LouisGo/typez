/**
 * Chat List Component
 * 显示聊天列表
 */
export function ChatList() {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Chats</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {/* Chat items will be rendered here */}
        <div className="p-4 text-muted-foreground text-sm">
          Chat list items...
        </div>
      </div>
    </div>
  )
}
