import { create } from 'zustand'
import { Chat } from '../domain/entities/chat.entity'
import { Message } from '../domain/entities/message.entity'
import { chatAPI } from '@infra/api'

/**
 * Chat Store State
 */
interface ChatState {
  chats: Chat[]
  selectedChatId: string | null
  messages: Message[]
  isLoading: boolean

  // Actions
  loadChats: () => Promise<void>
  selectChat: (chatId: string) => void
  loadMessages: (chatId: string) => Promise<void>
  sendMessage: (chatId: string, content: string) => Promise<void>
}

/**
 * Chat Store - Zustand
 */
export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  selectedChatId: null,
  messages: [],
  isLoading: false,

  loadChats: async () => {
    set({ isLoading: true })
    try {
      const chatTables = await chatAPI.getChats()
      const chats = chatTables.map(Chat.fromTable)
      set({ chats, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      console.error('Failed to load chats:', error)
    }
  },

  selectChat: (chatId: string) => {
    set({ selectedChatId: chatId })
    get().loadMessages(chatId)
  },

  loadMessages: async (chatId: string) => {
    set({ isLoading: true })
    try {
      const messageTables = await chatAPI.getMessages(chatId)
      const messages = messageTables.map(Message.fromTable)
      set({ messages, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      console.error('Failed to load messages:', error)
    }
  },

  sendMessage: async (chatId: string, content: string) => {
    try {
      const messageTable = await chatAPI.sendMessage(chatId, content)
      const newMessage = Message.fromTable(messageTable)

      const currentMessages = get().messages
      set({ messages: [...currentMessages, newMessage] })

      // 同时也更新聊天列表中的最后一条消息信息
      const chats = get().chats
      const updatedChats = chats.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            lastMessageId: newMessage.id,
            lastMessageAt: newMessage.createdAt
          } as Chat
        }
        return chat
      })
      set({ chats: updatedChats })
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }
}))
