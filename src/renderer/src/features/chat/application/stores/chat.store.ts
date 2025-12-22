import { create } from 'zustand'
import type { Chat } from '../../domain/entities/chat.entity'
import type { Message } from '../../domain/entities/message.entity'
import { mockChatDataSource } from '../../data/sources/chat.mock'

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
      const chats = await mockChatDataSource.getChats()
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
      const messages = await mockChatDataSource.getMessages(chatId)
      set({ messages, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      console.error('Failed to load messages:', error)
    }
  },
}))
