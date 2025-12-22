import { apiClient } from './client'
import type { ChatTable, MessageTable } from '@shared/types/database'

/**
 * 聊天 API
 */
export const chatAPI = {
  /**
   * 获取聊天列表
   */
  getChats: (): Promise<ChatTable[]> => {
    return apiClient.invoke<ChatTable[]>('chat:getChats')
  },

  /**
   * 获取单个聊天
   */
  getChatById: (chatId: string): Promise<ChatTable | null> => {
    return apiClient.invoke<ChatTable | null>('chat:getChatById', { chatId })
  },

  /**
   * 获取消息列表
   */
  getMessages: (chatId: string, limit?: number, offset?: number): Promise<MessageTable[]> => {
    return apiClient.invoke<MessageTable[]>('chat:getMessages', { chatId, limit, offset })
  },

  /**
   * 发送消息
   */
  sendMessage: (chatId: string, content: string): Promise<MessageTable> => {
    return apiClient.invoke<MessageTable>('chat:sendMessage', { chatId, content })
  }
}


