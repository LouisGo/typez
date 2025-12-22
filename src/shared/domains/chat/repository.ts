import type { Chat, ChatId, Message, Page, PageCursor } from './model'

export interface ChatRepository {
  listChats(): Promise<Chat[]>
  getMessagesPage(chatId: ChatId, cursor: PageCursor): Promise<Page<Message>>
  sendMessage(chatId: ChatId, text: string): Promise<Message>
}


