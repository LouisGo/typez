import { AuthService } from './auth.service'
import { ChatService } from './chat.service'
import { MockAuthService } from '../mock/services/auth.mock.service'
import type { IAuthService } from './auth.service.interface'
import type { IChatService } from './chat.service.interface'
import type { DatabaseService } from '../database'
import { ContactService } from './contact.service'
import type { IContactService } from './contact.service.interface'
import { GroupService } from './group.service'
import type { IGroupService } from './group.service.interface'
import { SearchService } from './search.service'
import type { ISearchService } from './search.service.interface'

// 环境检测
const isDevelopment = process.env.NODE_ENV === 'development'
const useMock = process.env.USE_MOCK === 'true' || isDevelopment

console.log(`[Services] 环境模式: ${isDevelopment ? '开发' : '生产'}, 使用 Mock: ${useMock}`)

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

  // Auth：mock/real 都是 db-backed（保持一致）
  authService = useMock ? new MockAuthService(db) : new AuthService(db)

  // Chat/Contact/Group/Search：统一走 SQLite，保证新增 contract 在开发模式也可用
  chatService = new ChatService(db, authService)
  contactService = new ContactService(db, authService)
  groupService = new GroupService(db, authService)
  searchService = new SearchService(db)
}
