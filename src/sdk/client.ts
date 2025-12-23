import type { Transport } from '@sdk/core/transport'
import { invokeOrThrow } from '@sdk/core/invoke'
import type { AuthManager } from '@sdk/auth/auth-manager'
import type { User } from '@shared/types/models'

export type TypezClient = ReturnType<typeof createTypezClient>

export function createTypezClient(input: { transport: Transport; auth?: AuthManager }) {
  const { transport, auth } = input

  const client = {
    /**
     * 仅用于内部/高级场景的通用调用入口（不建议业务日常使用）
     */
    invoke: <C extends import('@shared/types/ipc').IPCChannel>(
      channel: C,
      params?: import('@shared/types/ipc').IPCParams<C>
    ) => invokeOrThrow(transport, channel, params),

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
      logout: async (userId: string) => {
        await invokeOrThrow(transport, 'auth:logout', { userId })
        if (auth) await auth.setSession(null)
      },
      getCurrentUser: async (userId: string) => {
        const user = await invokeOrThrow(transport, 'auth:getCurrentUser', { userId })
        // 不强制写 session：交给上层决定是否用返回值覆盖
        return user
      },
      /**
       * 基于本地 session 的快捷访问（不触发远端请求）
       */
      getSessionUser: (): User | null => auth?.getUser() ?? null
    },

    chat: {
      list: () => invokeOrThrow(transport, 'chat:getChats'),
      byId: (chatId: string) => invokeOrThrow(transport, 'chat:getChatById', { chatId }),
      messages: (chatId: string, limit?: number, offset?: number) =>
        invokeOrThrow(transport, 'chat:getMessages', { chatId, limit, offset }),
      send: (chatId: string, content: string) =>
        invokeOrThrow(transport, 'chat:sendMessage', { chatId, content })
    }
  }

  return client
}
