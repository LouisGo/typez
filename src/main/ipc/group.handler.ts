import { groupService } from '../services'
import { createHandler } from './utils'

export function setupGroupHandlers(): void {
  createHandler('group:create', async (params) => {
    return await groupService.create({
      title: params.title,
      memberIds: params.memberIds,
      description: params.description
    })
  })

  createHandler('group:addMembers', async (params) => {
    await groupService.addMembers(params.chatId, params.memberIds)
  })

  createHandler('group:updateProfile', async (params) => {
    return await groupService.updateProfile(params.chatId, {
      title: params.title,
      avatarUrl: params.avatarUrl,
      description: params.description
    })
  })
}
