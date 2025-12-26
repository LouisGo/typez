import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import type { ChatId, UserId } from '@sdk/contract/models'

export async function groupRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>()

  server.post(
    '/',
    {
      schema: {
        body: z.object({
          title: z.string().min(1),
          memberIds: z.array(z.string()).default([]),
          description: z.string().optional()
        })
      }
    },
    async (req) => {
      return await server.services.group.create({
        title: req.body.title,
        memberIds: req.body.memberIds as unknown as UserId[],
        description: req.body.description
      })
    }
  )

  server.post(
    '/:chatId/members',
    {
      schema: {
        params: z.object({ chatId: z.string() }),
        body: z.object({ memberIds: z.array(z.string()).min(1) })
      }
    },
    async (req) => {
      await server.services.group.addMembers(
        req.params.chatId as ChatId,
        req.body.memberIds as unknown as UserId[]
      )
      return null
    }
  )

  server.patch(
    '/:chatId',
    {
      schema: {
        params: z.object({ chatId: z.string() }),
        body: z.object({
          title: z.string().optional(),
          avatarUrl: z.string().nullable().optional(),
          description: z.string().nullable().optional()
        })
      }
    },
    async (req) => {
      return await server.services.group.updateProfile(req.params.chatId as ChatId, req.body)
    }
  )
}
