import type { ChatRepository } from '../../domains/chat/repository'
import type { Chat, ChatId, Message, Page, PageCursor } from '../../domains/chat/model'

export interface ChatUsecases {
  listChats(): Promise<Chat[]>
  getMessagesPage(chatId: ChatId, cursor: PageCursor): Promise<Page<Message>>
  sendMessage(chatId: ChatId, text: string): Promise<Message>
}

export function createChatUsecases(repo: ChatRepository): ChatUsecases {
  return {
    listChats: () => repo.listChats(),
    getMessagesPage: (chatId, cursor) => repo.getMessagesPage(chatId, cursor),
    sendMessage: (chatId, text) => repo.sendMessage(chatId, text)
  }
}
