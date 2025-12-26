import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import type { ChatId, MessageId } from '@sdk/contract/models'

export async function chatRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>()

  server.get('/conversations', async () => {
    return await server.services.chat.getChats()
  })

  server.get(
    '/:chatId',
    {
      schema: {
        params: z.object({ chatId: z.string() })
      }
    },
    async (req) => {
      return await server.services.chat.getChatById(req.params.chatId as ChatId)
    }
  )

  server.get(
    '/:chatId/messages',
    {
      schema: {
        params: z.object({ chatId: z.string() }),
        querystring: z.object({
          limit: z.coerce.number().int().positive().optional(),
          offset: z.coerce.number().int().nonnegative().optional()
        })
      }
    },
    async (req) => {
      const { limit, offset } = req.query
      return await server.services.chat.getMessages(req.params.chatId as ChatId, limit, offset)
    }
  )

  server.post(
    '/:chatId/messages',
    {
      schema: {
        params: z.object({ chatId: z.string() }),
        body: z.object({ content: z.string() })
      }
    },
    async (req) => {
      return await server.services.chat.sendMessage(req.params.chatId as ChatId, req.body.content)
    }
  )

  server.get(
    '/:chatId/settings',
    { schema: { params: z.object({ chatId: z.string() }) } },
    async (req) => {
      return await server.services.chat.getSettings(req.params.chatId as ChatId)
    }
  )

  server.patch(
    '/:chatId/settings',
    {
      schema: {
        params: z.object({ chatId: z.string() }),
        body: z.object({
          pinned: z.boolean().optional(),
          muted: z.boolean().optional(),
          archived: z.boolean().optional()
        })
      }
    },
    async (req) => {
      return await server.services.chat.updateSettings(req.params.chatId as ChatId, req.body)
    }
  )

  server.post(
    '/:chatId/read',
    {
      schema: {
        params: z.object({ chatId: z.string() }),
        body: z.object({ lastReadMessageId: z.string().optional() }).optional()
      }
    },
    async (req) => {
      await server.services.chat.markRead(
        req.params.chatId as ChatId,
        req.body?.lastReadMessageId as MessageId
      )
      return null
    }
  )
}
