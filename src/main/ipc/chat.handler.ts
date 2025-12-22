import { ipcMain } from 'electron'
import { chatService } from '../services'

/**
 * 聊天 IPC Handlers
 */
export function setupChatHandlers(): void {
  // 获取聊天列表
  ipcMain.handle('chat:getChats', async () => {
    try {
      return await chatService.getChats()
    } catch (error) {
      console.error('[IPC] chat:getChats error:', error)
      throw error
    }
  })

  // 获取单个聊天
  ipcMain.handle('chat:getChatById', async (_, { chatId }) => {
    try {
      return await chatService.getChatById(chatId)
    } catch (error) {
      console.error('[IPC] chat:getChatById error:', error)
      throw error
    }
  })

  // 获取消息列表
  ipcMain.handle('chat:getMessages', async (_, { chatId, limit, offset }) => {
    try {
      return await chatService.getMessages(chatId, limit, offset)
    } catch (error) {
      console.error('[IPC] chat:getMessages error:', error)
      throw error
    }
  })

  // 发送消息
  ipcMain.handle('chat:sendMessage', async (_, { chatId, content }) => {
    try {
      return await chatService.sendMessage(chatId, content)
    } catch (error) {
      console.error('[IPC] chat:sendMessage error:', error)
      throw error
    }
  })
}
