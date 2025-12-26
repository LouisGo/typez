import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import type { DatabaseService } from '../../database'
import { faker } from '@faker-js/faker'
import { ChatGenerator, MessageGenerator, UserGenerator } from '../../mock/generators'
import type { ChatTable, MessageTable, UserTable } from '../../database/types'
import type { ChatType, UserId } from '@sdk/contract/models'

export async function mockRoutes(
  fastify: FastifyInstance,
  opts: {
    db: DatabaseService
  }
) {
  const server = fastify.withTypeProvider<ZodTypeProvider>()
  const db = opts.db

  server.post(
    '/seed',
    {
      schema: {
        body: z
          .object({
            seed: z.number().int().optional(),
            users: z.number().int().min(0).max(200).default(20),
            chats: z.number().int().min(0).max(200).default(20),
            messagesPerChat: z.number().int().min(0).max(500).default(50)
          })
          .optional()
      }
    },
    async (req) => {
      const input = req.body ?? { users: 20, chats: 20, messagesPerChat: 50 }
      if (input.seed !== undefined) faker.seed(input.seed)

      // 确保存在当前用户（用于把 seed 的会话列表绑到 TA 身上）
      let me = await server.services.auth.getCurrentUser()
      if (!me) {
        // demo 用户：固定用户名/密码，便于开发调试
        try {
          me = await server.services.auth.register('demo', 'Demo', '123456')
        } catch {
          me = await server.services.auth.login('demo', '123456')
        }
      }
      const meId = me.id as UserId

      const now = Date.now()
      const users: UserTable[] = UserGenerator.generate(input.users).map((u) => ({
        ...u,
        // 避免与 demo 用户冲突
        username: `u_${u.username}_${faker.string.alphanumeric(4)}`
      }))

      // 批量写入 users（忽略冲突）
      db.transaction(() => {
        for (const u of users) {
          try {
            db.insert({ table: 'users', data: u as unknown as Record<string, unknown> })
          } catch {
            // ignore
          }
        }
      })

      const chats: ChatTable[] = ChatGenerator.generate(input.chats)

      db.transaction(() => {
        for (const c of chats) {
          // chats 表你现在已经扩展了 created_by/metadata/deleted_at，这里最小填充
          const chat: Record<string, unknown> = {
            ...c,
            created_by: meId,
            metadata: null,
            deleted_at: null
          }
          try {
            db.insert({ table: 'chats', data: chat })
          } catch {
            // ignore
          }

          // 给每个 chat 插入成员：保证 me 一定在里面，否则会话列表拉不到
          const memberIds: string[] = [meId]

          if (c.type === ('private' satisfies ChatType)) {
            memberIds.push(users[0]?.id ?? faker.string.uuid())
          } else {
            // group/channel：随机选 2-5 个
            const extra = faker.helpers.arrayElements(
              users.map((u) => u.id),
              faker.number.int({ min: 2, max: 5 })
            )
            memberIds.push(...extra)
          }

          const uniq = Array.from(new Set(memberIds))
          for (const uid of uniq) {
            try {
              db.insert({
                table: 'chat_members',
                data: {
                  id: crypto.randomUUID(),
                  chat_id: c.id,
                  user_id: uid,
                  role: uid === meId ? 'owner' : 'member',
                  joined_at: now,
                  left_at: null
                }
              })
            } catch {
              // ignore duplicates
            }
          }

          // messages
          const msgs: MessageTable[] = MessageGenerator.generate(c.id, input.messagesPerChat).map(
            (m, idx) => {
              const sender = uniq[idx % uniq.length] ?? meId
              return {
                ...m,
                sender_id: sender,
                client_id: null,
                status: 'sent',
                edited_at: null,
                deleted_at: null
              } as unknown as MessageTable
            }
          )

          for (const m of msgs) {
            try {
              db.insert({ table: 'messages', data: m as unknown as Record<string, unknown> })
            } catch {
              // ignore
            }
          }

          const last = msgs.sort((a, b) => b.created_at - a.created_at)[0]
          if (last) {
            db.update({
              table: 'chats',
              data: {
                last_message_id: last.id,
                last_message_at: last.created_at,
                updated_at: now
              },
              where: { id: c.id }
            })
          }
        }
      })

      return {
        me,
        created: {
          users: users.length,
          chats: chats.length,
          messages: chats.length * input.messagesPerChat
        }
      }
    }
  )
}
