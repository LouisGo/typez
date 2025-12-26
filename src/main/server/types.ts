import type { IAuthService } from '../services/auth.service.interface'
import type { IChatService } from '../services/chat.service.interface'
import type { IContactService } from '../services/contact.service.interface'
import type { IGroupService } from '../services/group.service.interface'
import type { ISearchService } from '../services/search.service.interface'

export type ServerServices = {
  auth: IAuthService
  chat: IChatService
  contact: IContactService
  group: IGroupService
  search: ISearchService
}

declare module 'fastify' {
  interface FastifyInstance {
    services: ServerServices
  }
}
