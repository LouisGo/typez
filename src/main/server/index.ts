import fastify from 'fastify'
import cors from '@fastify/cors'
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import { authRoutes } from './routes/auth'
import { chatRoutes } from './routes/chat'
import { groupRoutes } from './routes/group'
import { contactRoutes } from './routes/contact'
import { searchRoutes } from './routes/search'
import { mockRoutes } from './routes/mock'
import { dbRoutes } from './routes/db'
import { protocolPlugin } from './plugins/protocol'
import { servicesPlugin } from './plugins/services'
import './types'
import type { DatabaseService } from '../database'
import {
  initServices,
  authService,
  chatService,
  contactService,
  groupService,
  searchService
} from '../services'

export async function bootstrapServer(input: { db: DatabaseService }) {
  const server = fastify({
    logger: true // 开启日志方便调试
  })

  // 1. 设置 Zod 编译器/验证器，实现自动类型推断和验证
  server.setValidatorCompiler(validatorCompiler)
  server.setSerializerCompiler(serializerCompiler)

  // 2. 注册 CORS (开发模式允许跨域，方便 Renderer 使用 fetch 调用)
  await server.register(cors, {
    origin: true
  })

  // 3. 初始化 services（确保 db 注入一次）
  initServices(input.db)

  // 4. 注册插件
  await server.register(servicesPlugin, {
    services: {
      auth: authService,
      chat: chatService,
      contact: contactService,
      group: groupService,
      search: searchService
    }
  })
  await server.register(protocolPlugin)

  // 5. 注册路由
  server.get('/api/health', async () => ({ status: 'ok' }))

  server.register(authRoutes, { prefix: '/api/auth' })
  server.register(chatRoutes, { prefix: '/api/chat' })
  server.register(groupRoutes, { prefix: '/api/group' })
  server.register(contactRoutes, { prefix: '/api/contact' })
  server.register(searchRoutes, { prefix: '/api/search' })

  // 仅开发环境暴露 mock/seed（后续可改成显式开关）
  if (process.env.API_MOCK === 'true' || process.env.NODE_ENV === 'development') {
    server.register(
      async (s) => {
        await mockRoutes(s, { db: input.db })
      },
      { prefix: '/api/mock' }
    )
  }

  // DB 调试接口：仅开发环境开放（或显式开启）
  if (process.env.API_DB === 'true' || process.env.NODE_ENV === 'development') {
    server.register(
      async (s) => {
        await dbRoutes(s, { db: input.db })
      },
      { prefix: '/api/db' }
    )
  }

  // 6. 启动服务
  try {
    const port = 3456
    await server.listen({ port, host: '127.0.0.1' })
    console.log(`[Fastify] Server listening on http://127.0.0.1:${port}`)
    return {
      port,
      close: async () => {
        await server.close()
      }
    }
  } catch (err) {
    server.log.error(err)
    // 注意: 在 Electron Main 进程中通常不直接 process.exit，以免误杀整个应用
    // 但如果端口冲突需要处理
  }

  return {
    port: null as number | null,
    close: async () => {
      await server.close()
    }
  }
}
