/**
 * Chat Page
 * 主聊天界面
 */
export function ChatPage() {
  return (
    <div className="flex h-screen">
      <div className="w-80 border-r">
        {/* Sidebar with chat list */}
        <div className="p-4">
          <h1 className="text-xl font-bold">Typey</h1>
        </div>
      </div>
      <div className="flex-1">
        {/* Main chat area */}
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Select a chat to start messaging
        </div>
      </div>
    </div>
  )
}
