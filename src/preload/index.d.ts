import { ElectronAPI } from '@electron-toolkit/preload'
import type {
  IPCChannel,
  IPCParams,
  IPCResult,
  QueryParams,
  QueryResult,
  InsertParams,
  InsertResult,
  UpdateParams,
  UpdateResult,
  DeleteParams,
  DeleteResult,
  LoginParams,
  RegisterParams,
  LogoutParams,
  GetCurrentUserParams,
  GetChatByIdParams,
  GetMessagesParams,
  SendMessageParams
} from '@shared/types/ipc'
import type { UserTable, ChatTable, MessageTable } from '@shared/types/database'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      /**
       * 类型安全的通用 IPC 调用方法
       * @template C - IPC Channel 名称
       */
      invoke: <C extends IPCChannel>(channel: C, params?: IPCParams<C>) => Promise<IPCResult<C>>

      db: {
        query: (params: QueryParams) => Promise<QueryResult>
        insert: (params: InsertParams) => Promise<InsertResult>
        update: (params: UpdateParams) => Promise<UpdateResult>
        delete: (params: DeleteParams) => Promise<DeleteResult>
      }

      auth: {
        login: (params: LoginParams) => Promise<UserTable>
        register: (params: RegisterParams) => Promise<UserTable>
        logout: (params: LogoutParams) => Promise<void>
        getCurrentUser: (params: GetCurrentUserParams) => Promise<UserTable | null>
      }

      chat: {
        getChats: () => Promise<ChatTable[]>
        getChatById: (params: GetChatByIdParams) => Promise<ChatTable | null>
        getMessages: (params: GetMessagesParams) => Promise<MessageTable[]>
        sendMessage: (params: SendMessageParams) => Promise<MessageTable>
      }
    }
  }
}
