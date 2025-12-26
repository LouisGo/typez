import type { ChatId, Message, User } from '@sdk/contract/models'

export interface ISearchService {
  searchUsers(query: string, limit?: number, offset?: number): Promise<User[]>
  searchMessages(
    query: string,
    input?: { chatId?: ChatId; limit?: number; offset?: number }
  ): Promise<Message[]>
}
