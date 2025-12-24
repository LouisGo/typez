import type { Transport } from '@sdk/core/transport'
import { invokeOrThrow } from '@sdk/core/invoke'
import type { AuthManager } from '@sdk/auth/auth-manager'
import type { User, UserId, ChatId } from './contract/models'
import type { APIChannel, ContractParams } from './contract'

export type TypezClient = ReturnType<typeof createTypezClient>

export function createTypezClient(input: { transport: Transport; auth?: AuthManager }) {
  const { transport, auth } = input

  const client = {
    /**
     * 仅用于内部/高级场景的通用调用入口（不建议业务日常使用）
     */
    invoke: <C extends APIChannel>(channel: C, params?: ContractParams<C>) =>
      invokeOrThrow(transport, channel, params),

    /**
     * 事件监听
     */
    on: transport.on.bind(transport),
    off: transport.off.bind(transport),

    auth: {
      login: async (username: string, password: string) => {
        const user = await invokeOrThrow(transport, 'auth:login', { username, password })
        if (auth) await auth.setSession({ user })
        return user
      },
      register: async (username: string, displayName: string, password: string) => {
        const user = await invokeOrThrow(transport, 'auth:register', {
          username,
          displayName,
          password
        })
        if (auth) await auth.setSession({ user })
        return user
      },
      logout: async (userId: UserId) => {
        await invokeOrThrow(transport, 'auth:logout', { userId })
        if (auth) await auth.setSession(null)
      },
      me: async () => {
        const user = await invokeOrThrow(transport, 'auth:me')
        return user
      },
      /**
       * 基于本地 session 的快捷访问（不触发远端请求）
       */
      getSessionUser: (): User | null => auth?.getUser() ?? null
    },

    chat: {
      getConversations: () => invokeOrThrow(transport, 'chat:getConversations'),
      getConversationById: (chatId: ChatId) =>
        invokeOrThrow(transport, 'chat:getConversationById', { chatId }),
      getMessages: (chatId: ChatId, limit?: number, offset?: number) =>
        invokeOrThrow(transport, 'chat:getMessages', { chatId, limit, offset }),
      sendMessage: (chatId: ChatId, content: string) =>
        invokeOrThrow(transport, 'chat:sendMessage', { chatId, content })
    }
  }

  return client
}
