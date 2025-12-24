import type { Chat, Message } from '@sdk/types/models'

/**
 * 聊天服务接口
 * 返回 camelCase 格式的领域模型
 */
export interface IChatService {
  getChats(): Promise<Chat[]>
  getChatById(id: string): Promise<Chat | null>
  getMessages(chatId: string, limit?: number, offset?: number): Promise<Message[]>
  sendMessage(chatId: string, content: string): Promise<Message>
}
