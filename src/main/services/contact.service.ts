import type { DatabaseService } from '../database'
import type { IAuthService } from './auth.service.interface'
import type { IContactService } from './contact.service.interface'
import type {
  Contact,
  ContactRequest,
  ContactRequestId,
  ContactRequestStatus,
  UserId
} from '@sdk/contract/models'
import { createAuthError } from '@sdk/auth/errors'

type ContactRow = {
  id: string
  user_id: string
  contact_user_id: string
  nickname: string | null
  blocked: number
  favorite: number
  created_at: number
}

type ContactRequestRow = {
  id: string
  from_user_id: string
  to_user_id: string
  message: string | null
  status: ContactRequestStatus
  created_at: number
  updated_at: number
}

function contactRowToModel(row: ContactRow): Contact {
  return {
    id: row.id as any,
    userId: row.user_id as UserId,
    contactUserId: row.contact_user_id as UserId,
    nickname: row.nickname,
    blocked: Boolean(row.blocked),
    favorite: Boolean(row.favorite),
    createdAt: row.created_at
  }
}

function contactRequestRowToModel(row: ContactRequestRow): ContactRequest {
  return {
    id: row.id as ContactRequestId,
    fromUserId: row.from_user_id as UserId,
    toUserId: row.to_user_id as UserId,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export class ContactService implements IContactService {
  constructor(
    private db: DatabaseService,
    private auth: IAuthService
  ) {}

  private async requireMe(): Promise<UserId> {
    const me = await this.auth.getCurrentUser()
    if (!me) throw createAuthError.notLoggedIn()
    return me.id
  }

  async list(): Promise<Contact[]> {
    const meId = await this.requireMe()
    const rows = this.db.rawAll<ContactRow>(
      'SELECT * FROM contacts WHERE user_id = ? ORDER BY created_at DESC',
      [meId]
    )
    return rows.map(contactRowToModel)
  }

  async request(toUserId: UserId, message?: string): Promise<ContactRequest> {
    const meId = await this.requireMe()
    const now = Date.now()
    const id = crypto.randomUUID() as ContactRequestId

    // 如果已经有请求，直接更新为 pending（简单幂等）
    const existing = this.db.rawGet<ContactRequestRow>(
      'SELECT * FROM contact_requests WHERE from_user_id = ? AND to_user_id = ?',
      [meId, toUserId]
    )
    if (existing) {
      this.db.rawRun(
        'UPDATE contact_requests SET message = ?, status = ?, updated_at = ? WHERE id = ?',
        [message ?? existing.message, 'pending', now, existing.id]
      )
      const latest = this.db.rawGet<ContactRequestRow>(
        'SELECT * FROM contact_requests WHERE id = ?',
        [existing.id]
      )!
      return contactRequestRowToModel(latest)
    }

    this.db.rawRun(
      `INSERT INTO contact_requests (id, from_user_id, to_user_id, message, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, meId, toUserId, message ?? null, 'pending', now, now]
    )
    const row = this.db.rawGet<ContactRequestRow>('SELECT * FROM contact_requests WHERE id = ?', [
      id
    ])!
    return contactRequestRowToModel(row)
  }

  async respondRequest(
    requestId: ContactRequestId,
    action: 'accept' | 'reject' | 'cancel'
  ): Promise<Contact> {
    const meId = await this.requireMe()
    const now = Date.now()

    const req = this.db.rawGet<ContactRequestRow>('SELECT * FROM contact_requests WHERE id = ?', [
      requestId
    ])
    if (!req) {
      // 这里暂用“未知错误”语义；后续可加 CONTACT/REQUEST_NOT_FOUND
      throw new Error('好友申请不存在')
    }

    const isTo = req.to_user_id === meId
    const isFrom = req.from_user_id === meId

    if (action === 'accept') {
      if (!isTo) throw new Error('无权处理该好友申请')
      return this.db.transaction(() => {
        this.db.rawRun('UPDATE contact_requests SET status = ?, updated_at = ? WHERE id = ?', [
          'accepted',
          now,
          requestId
        ])

        const a = req.from_user_id as UserId
        const b = req.to_user_id as UserId

        // A -> B
        const c1 = this.db.rawGet<ContactRow>(
          'SELECT * FROM contacts WHERE user_id = ? AND contact_user_id = ?',
          [a, b]
        )
        if (!c1) {
          this.db.rawRun(
            `INSERT INTO contacts (id, user_id, contact_user_id, nickname, blocked, favorite, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [crypto.randomUUID(), a, b, null, 0, 0, now]
          )
        }

        // B -> A
        const c2 = this.db.rawGet<ContactRow>(
          'SELECT * FROM contacts WHERE user_id = ? AND contact_user_id = ?',
          [b, a]
        )
        if (!c2) {
          this.db.rawRun(
            `INSERT INTO contacts (id, user_id, contact_user_id, nickname, blocked, favorite, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [crypto.randomUUID(), b, a, null, 0, 0, now]
          )
        }

        const myContact = this.db.rawGet<ContactRow>(
          'SELECT * FROM contacts WHERE user_id = ? AND contact_user_id = ?',
          [meId, req.from_user_id]
        )
        if (!myContact) throw new Error('好友关系创建失败')
        return contactRowToModel(myContact)
      })
    }

    if (action === 'reject') {
      if (!isTo) throw new Error('无权处理该好友申请')
      this.db.rawRun('UPDATE contact_requests SET status = ?, updated_at = ? WHERE id = ?', [
        'rejected',
        now,
        requestId
      ])
      // 返回一个“当前不存在”的 Contact 不合理，这里按契约先返回我->对方（若存在）
      const existing = this.db.rawGet<ContactRow>(
        'SELECT * FROM contacts WHERE user_id = ? AND contact_user_id = ?',
        [meId, req.from_user_id]
      )
      if (!existing) {
        // 兜底：返回一个虚拟对象（前端后续应以状态为准）
        return contactRowToModel({
          id: crypto.randomUUID(),
          user_id: meId,
          contact_user_id: req.from_user_id,
          nickname: null,
          blocked: 0,
          favorite: 0,
          created_at: now
        })
      }
      return contactRowToModel(existing)
    }

    // cancel
    if (!isFrom) throw new Error('无权取消该好友申请')
    this.db.rawRun('UPDATE contact_requests SET status = ?, updated_at = ? WHERE id = ?', [
      'cancelled',
      now,
      requestId
    ])
    // 同 reject 的返回策略
    const existing = this.db.rawGet<ContactRow>(
      'SELECT * FROM contacts WHERE user_id = ? AND contact_user_id = ?',
      [meId, req.to_user_id]
    )
    if (!existing) {
      return contactRowToModel({
        id: crypto.randomUUID(),
        user_id: meId,
        contact_user_id: req.to_user_id,
        nickname: null,
        blocked: 0,
        favorite: 0,
        created_at: now
      })
    }
    return contactRowToModel(existing)
  }

  async blockUser(userId: UserId, blocked: boolean): Promise<void> {
    const meId = await this.requireMe()
    const now = Date.now()
    const existing = this.db.rawGet<ContactRow>(
      'SELECT * FROM contacts WHERE user_id = ? AND contact_user_id = ?',
      [meId, userId]
    )

    if (existing) {
      this.db.rawRun('UPDATE contacts SET blocked = ? WHERE id = ?', [blocked ? 1 : 0, existing.id])
      return
    }

    // 不存在联系人记录：仅在 blocked=true 时写入一条“黑名单”记录
    if (blocked) {
      this.db.rawRun(
        `INSERT INTO contacts (id, user_id, contact_user_id, nickname, blocked, favorite, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [crypto.randomUUID(), meId, userId, null, 1, 0, now]
      )
    }
  }
}
