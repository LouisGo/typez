import type { ChatTable, MessageTable } from '@shared/types/database'

/**
 * 聊天服务接口
 */
export interface IChatService {
  getChats(): Promise<ChatTable[]>
  getChatById(id: string): Promise<ChatTable | null>
  getMessages(chatId: string, limit?: number, offset?: number): Promise<MessageTable[]>
  sendMessage(chatId: string, content: string): Promise<MessageTable>
}
