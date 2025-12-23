import { apiClient } from './client'

/**
 * 聊天 API
 * 封装所有聊天相关的 IPC 调用
 * 所有类型自动从 IPCChannels 推导，无需手动指定
 */
export const chatAPI = {
  /**
   * 获取聊天列表
   * @returns Promise<ChatTable[]> - 聊天列表
   */
  getChats: () => {
    return apiClient.invoke('chat:getChats')
  },

  /**
   * 获取单个聊天
   * @param chatId - 聊天 ID
   * @returns Promise<ChatTable | null> - 聊天信息或 null
   */
  getChatById: (chatId: string) => {
    return apiClient.invoke('chat:getChatById', { chatId })
  },

  /**
   * 获取消息列表
   * @param chatId - 聊天 ID
   * @param limit - 限制数量（可选）
   * @param offset - 偏移量（可选）
   * @returns Promise<MessageTable[]> - 消息列表
   */
  getMessages: (chatId: string, limit?: number, offset?: number) => {
    return apiClient.invoke('chat:getMessages', { chatId, limit, offset })
  },

  /**
   * 发送消息
   * @param chatId - 聊天 ID
   * @param content - 消息内容
   * @returns Promise<MessageTable> - 创建的消息
   */
  sendMessage: (chatId: string, content: string) => {
    return apiClient.invoke('chat:sendMessage', { chatId, content })
  }
}
