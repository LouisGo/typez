import { contactService } from '../services'
import { createHandler } from './utils'

export function setupContactHandlers(): void {
  createHandler('contact:list', async () => {
    return await contactService.list()
  })

  createHandler('contact:request', async (params) => {
    return await contactService.request(params.toUserId, params.message)
  })

  createHandler('contact:respondRequest', async (params) => {
    return await contactService.respondRequest(params.requestId, params.action)
  })

  createHandler('contact:blockUser', async (params) => {
    await contactService.blockUser(params.userId, params.blocked)
  })
}
