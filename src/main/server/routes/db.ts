import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import type { DatabaseService } from '../../database'

const querySchema = z.object({
  table: z.string(),
  where: z.record(z.string(), z.unknown()).optional(),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
  orderBy: z
    .object({
      field: z.string(),
      direction: z.enum(['asc', 'desc'])
    })
    .optional()
})

const insertSchema = z.object({
  table: z.string(),
  data: z.record(z.string(), z.unknown())
})

const updateSchema = z.object({
  table: z.string(),
  data: z.record(z.string(), z.unknown()),
  where: z.record(z.string(), z.unknown())
})

const deleteSchema = z.object({
  table: z.string(),
  where: z.record(z.string(), z.unknown())
})

/**
 * 内部 DB 调试路由（尽量不要在生产开放）
 */
export async function dbRoutes(
  fastify: FastifyInstance,
  opts: {
    db: DatabaseService
  }
) {
  const server = fastify.withTypeProvider<ZodTypeProvider>()
  const db = opts.db

  server.post('/query', { schema: { body: querySchema } }, async (req) => {
    return db.query(req.body)
  })

  server.post('/insert', { schema: { body: insertSchema } }, async (req) => {
    return db.insert(req.body)
  })

  server.post('/update', { schema: { body: updateSchema } }, async (req) => {
    return db.update(req.body)
  })

  server.post('/delete', { schema: { body: deleteSchema } }, async (req) => {
    return db.delete(req.body)
  })
}
