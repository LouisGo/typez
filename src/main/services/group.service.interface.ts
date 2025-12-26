import type { Chat, ChatId, UserId } from '@sdk/contract/models'

export interface IGroupService {
  create(input: { title: string; memberIds: UserId[]; description?: string }): Promise<Chat>
  addMembers(chatId: ChatId, memberIds: UserId[]): Promise<void>
  updateProfile(
    chatId: ChatId,
    input: { title?: string; avatarUrl?: string | null; description?: string | null }
  ): Promise<Chat>
}
