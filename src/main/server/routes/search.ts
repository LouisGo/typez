import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import type { ChatId } from '@sdk/contract/models'

export async function searchRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>()

  server.get(
    '/users',
    {
      schema: {
        querystring: z.object({
          query: z.string().min(1),
          limit: z.coerce.number().int().positive().optional(),
          offset: z.coerce.number().int().nonnegative().optional()
        })
      }
    },
    async (req) => {
      return await server.services.search.searchUsers(
        req.query.query,
        req.query.limit,
        req.query.offset
      )
    }
  )

  server.get(
    '/messages',
    {
      schema: {
        querystring: z.object({
          query: z.string().min(1),
          chatId: z.string().optional(),
          limit: z.coerce.number().int().positive().optional(),
          offset: z.coerce.number().int().nonnegative().optional()
        })
      }
    },
    async (req) => {
      return await server.services.search.searchMessages(req.query.query, {
        chatId: req.query.chatId as ChatId,
        limit: req.query.limit,
        offset: req.query.offset
      })
    }
  )
}
