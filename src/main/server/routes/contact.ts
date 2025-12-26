import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import type { ContactRequestId, UserId } from '@sdk/contract/models'

export async function contactRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>()

  server.get('/', async () => {
    return await server.services.contact.list()
  })

  server.post(
    '/request',
    {
      schema: {
        body: z.object({
          toUserId: z.string(),
          message: z.string().optional()
        })
      }
    },
    async (req) => {
      return await server.services.contact.request(req.body.toUserId as UserId, req.body.message)
    }
  )

  server.post(
    '/request/respond',
    {
      schema: {
        body: z.object({
          requestId: z.string(),
          action: z.enum(['accept', 'reject', 'cancel'])
        })
      }
    },
    async (req) => {
      return await server.services.contact.respondRequest(
        req.body.requestId as ContactRequestId,
        req.body.action
      )
    }
  )

  server.post(
    '/block',
    {
      schema: {
        body: z.object({
          userId: z.string(),
          blocked: z.boolean()
        })
      }
    },
    async (req) => {
      await server.services.contact.blockUser(req.body.userId as UserId, req.body.blocked)
      return null
    }
  )
}
