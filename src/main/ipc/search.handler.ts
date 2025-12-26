import { searchService } from '../services'
import { createHandler } from './utils'

export function setupSearchHandlers(): void {
  createHandler('search:users', async (params) => {
    return await searchService.searchUsers(params.query, params.limit, params.offset)
  })

  createHandler('search:messages', async (params) => {
    return await searchService.searchMessages(params.query, {
      chatId: params.chatId,
      limit: params.limit,
      offset: params.offset
    })
  })
}
