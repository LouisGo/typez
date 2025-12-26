import type {
  APIChannel,
  ContractParams,
  ContractResult,
  EventChannel,
  EventContract
} from '@sdk/contract'
import type { Transport } from '@sdk/core/transport'
import type { ProtocolResult } from '@sdk/core/protocol'

type RequestSpec =
  | {
      method: 'GET'
      path: (params: any) => string
      query?: (params: any) => Record<string, unknown>
    }
  | { method: 'POST' | 'PATCH'; path: (params: any) => string; body?: (params: any) => unknown }

function toQueryString(query: Record<string, unknown> | undefined): string {
  if (!query) return ''
  const usp = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue
    usp.set(k, String(v))
  }
  const s = usp.toString()
  return s ? `?${s}` : ''
}

const channelToRequest: Record<APIChannel, RequestSpec> = {
  // Auth
  'auth:login': { method: 'POST', path: () => '/api/auth/login', body: (p) => p },
  'auth:register': { method: 'POST', path: () => '/api/auth/register', body: (p) => p },
  'auth:logout': { method: 'POST', path: () => '/api/auth/logout', body: (p) => p },
  'auth:me': { method: 'GET', path: () => '/api/auth/me' },

  // Chat
  'chat:getConversations': { method: 'GET', path: () => '/api/chat/conversations' },
  'chat:getConversationById': { method: 'GET', path: (p) => `/api/chat/${p.chatId}` },
  'chat:getMessages': {
    method: 'GET',
    path: (p) => `/api/chat/${p.chatId}/messages`,
    query: (p) => ({ limit: p.limit, offset: p.offset })
  },
  'chat:sendMessage': {
    method: 'POST',
    path: (p) => `/api/chat/${p.chatId}/messages`,
    body: (p) => ({ content: p.content })
  },
  'chat:getSettings': { method: 'GET', path: (p) => `/api/chat/${p.chatId}/settings` },
  'chat:updateSettings': {
    method: 'PATCH',
    path: (p) => `/api/chat/${p.chatId}/settings`,
    body: (p) => ({ pinned: p.pinned, muted: p.muted, archived: p.archived })
  },
  'chat:markRead': {
    method: 'POST',
    path: (p) => `/api/chat/${p.chatId}/read`,
    body: (p) => ({ lastReadMessageId: p.lastReadMessageId })
  },

  // Group
  'group:create': { method: 'POST', path: () => '/api/group', body: (p) => p },
  'group:addMembers': {
    method: 'POST',
    path: (p) => `/api/group/${p.chatId}/members`,
    body: (p) => p
  },
  'group:updateProfile': { method: 'PATCH', path: (p) => `/api/group/${p.chatId}`, body: (p) => p },

  // Contact
  'contact:list': { method: 'GET', path: () => '/api/contact' },
  'contact:request': { method: 'POST', path: () => '/api/contact/request', body: (p) => p },
  'contact:respondRequest': {
    method: 'POST',
    path: () => '/api/contact/request/respond',
    body: (p) => p
  },
  'contact:blockUser': { method: 'POST', path: () => '/api/contact/block', body: (p) => p },

  // Search
  'search:users': { method: 'GET', path: () => '/api/search/users', query: (p) => p },
  'search:messages': { method: 'GET', path: () => '/api/search/messages', query: (p) => p },

  // DB legacy：暂不暴露（需要的话再加 /api/db/*）
  'db:query': { method: 'POST', path: () => '/api/db/query', body: (p) => p },
  'db:insert': { method: 'POST', path: () => '/api/db/insert', body: (p) => p },
  'db:update': { method: 'POST', path: () => '/api/db/update', body: (p) => p },
  'db:delete': { method: 'POST', path: () => '/api/db/delete', body: (p) => p }
}

export function createHttpRendererTransport(input: { baseUrl: string }): Transport {
  const baseUrl = input.baseUrl.replace(/\/+$/, '')
  return {
    async request<C extends APIChannel>(
      channel: C,
      params?: ContractParams<C>
    ): Promise<ContractResult<C>> {
      const spec = channelToRequest[channel]
      const p = (params ?? ({} as any)) as any
      const urlPath = spec.path(p)
      const url =
        spec.method === 'GET'
          ? `${baseUrl}${urlPath}${toQueryString(spec.query?.(p))}`
          : `${baseUrl}${urlPath}`

      const res = await fetch(url, {
        method: spec.method,
        headers: spec.method === 'GET' ? undefined : { 'content-type': 'application/json' },
        body: spec.method === 'GET' ? undefined : JSON.stringify(spec.body ? spec.body(p) : p)
      })

      const json = (await res.json()) as ProtocolResult<unknown>
      return json as ContractResult<C>
    },

    on<E extends EventChannel>(_event: E, _listener: (payload: EventContract[E]) => void): void {
      // MVP：HTTP push 暂不实现（后续用 SSE/WS）
    },

    off<E extends EventChannel>(_event: E, _listener: (payload: EventContract[E]) => void): void {
      // noop
    }
  }
}
