import { typezClient } from '@infra/sdk'

/**
 * 聊天 API
 * 封装所有聊天相关的 IPC 调用
 * 所有类型自动从 IPCChannels 推导，返回 camelCase 格式的领域模型
 */
export const chatAPI = {
  /**
   * 获取聊天列表
   * @returns Promise<Chat[]> - 聊天列表（camelCase）
   */
  getChats: () => {
    return typezClient.chat.getConversations()
  },

  /**
   * 获取单个聊天
   * @param chatId - 聊天 ID
   * @returns Promise<Chat | null> - 聊天信息或 null（camelCase）
   */
  getChatById: (chatId: string) => {
    return typezClient.chat.getConversationById(chatId)
  },

  /**
   * 获取消息列表
   * @param chatId - 聊天 ID
   * @param limit - 限制数量（可选）
   * @param offset - 偏移量（可选）
   * @returns Promise<Message[]> - 消息列表（camelCase）
   */
  getMessages: (chatId: string, limit?: number, offset?: number) => {
    return typezClient.chat.getMessages(chatId, limit, offset)
  },

  /**
   * 发送消息
   * @param chatId - 聊天 ID
   * @param content - 消息内容
   * @returns Promise<Message> - 创建的消息（camelCase）
   */
  sendMessage: (chatId: string, content: string) => {
    return typezClient.chat.sendMessage(chatId, content)
  }
}
