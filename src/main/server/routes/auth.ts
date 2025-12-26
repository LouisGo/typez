import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import type { UserId } from '@sdk/contract/models'

export async function authRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>()

  server.post(
    '/login',
    {
      schema: {
        body: z.object({
          username: z.string(),
          password: z.string()
        })
      }
    },
    async (req) => {
      const { username, password } = req.body
      return await server.services.auth.login(username, password)
    }
  )

  server.post(
    '/register',
    {
      schema: {
        body: z.object({
          username: z.string(),
          displayName: z.string(),
          password: z.string()
        })
      }
    },
    async (req) => {
      const { username, displayName, password } = req.body
      return await server.services.auth.register(username, displayName, password)
    }
  )

  server.post(
    '/logout',
    {
      schema: {
        body: z.object({
          userId: z.string()
        })
      }
    },
    async (req) => {
      const { userId } = req.body
      // 注意: logout 接收 UserId，这里按最小实现直接断言
      await server.services.auth.logout(userId as UserId)
      return null
    }
  )

  server.get('/me', async () => {
    return await server.services.auth.getCurrentUser()
  })
}
