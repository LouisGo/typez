import type { Chat, Message, ChatId, ChatUserSettings, MessageId } from '@sdk/contract/models'

/**
 * 聊天服务接口
 * 返回 camelCase 格式的领域模型
 */
export interface IChatService {
  getChats(): Promise<Chat[]>
  getChatById(id: ChatId): Promise<Chat | null>
  getMessages(chatId: ChatId, limit?: number, offset?: number): Promise<Message[]>
  sendMessage(chatId: ChatId, content: string): Promise<Message>
  getSettings(chatId: ChatId): Promise<ChatUserSettings | null>
  updateSettings(
    chatId: ChatId,
    input: { pinned?: boolean; muted?: boolean; archived?: boolean }
  ): Promise<ChatUserSettings>
  markRead(chatId: ChatId, lastReadMessageId?: MessageId): Promise<void>
}
