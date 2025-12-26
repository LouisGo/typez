import { AuthService } from './auth.service'
import { ChatService } from './chat.service'
import type { IAuthService } from './auth.service.interface'
import type { IChatService } from './chat.service.interface'
import type { DatabaseService } from '../database'
import { ContactService } from './contact.service'
import type { IContactService } from './contact.service.interface'
import { GroupService } from './group.service'
import type { IGroupService } from './group.service.interface'
import { SearchService } from './search.service'
import type { ISearchService } from './search.service.interface'

console.log('[Services] 使用 Fastify + SQLite 服务实现（不再启用旧 MockService）')

// 由 main 侧注入 db，避免重复创建连接
let inited = false

export let authService: IAuthService
export let chatService: IChatService
export let contactService: IContactService
export let groupService: IGroupService
export let searchService: ISearchService

export function initServices(db: DatabaseService): void {
  if (inited) return
  inited = true

  // Auth：统一使用真实服务；mock 数据通过 /api/mock/seed 落库生成
  authService = new AuthService(db)

  // Chat/Contact/Group/Search：统一走 SQLite，保证新增 contract 在开发模式也可用
  chatService = new ChatService(db, authService)
  contactService = new ContactService(db, authService)
  groupService = new GroupService(db, authService)
  searchService = new SearchService(db)
}
