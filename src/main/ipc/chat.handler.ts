import { chatService } from '../services'
import { createHandler } from './utils'

/**
 * 聊天 IPC Handlers
 */
export function setupChatHandlers(): void {
  // 获取聊天列表
  createHandler('chat:getChats', async () => {
    return await chatService.getChats()
  })

  // 获取单个聊天
  createHandler('chat:getChatById', async (params) => {
    return await chatService.getChatById(params.chatId)
  })

  // 获取消息列表
  createHandler('chat:getMessages', async (params) => {
    return await chatService.getMessages(params.chatId, params.limit, params.offset)
  })

  // 发送消息
  createHandler('chat:sendMessage', async (params) => {
    return await chatService.sendMessage(params.chatId, params.content)
  })
}
