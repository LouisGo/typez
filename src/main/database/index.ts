import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import type { QueryParams, QueryResult, InsertParams, InsertResult } from '@sdk/contract'
import { migrations } from './migration-manifest'

/**
 * SQLite 数据库服务
 * 处理所有数据库操作
 */
export class DatabaseService {
  private db: Database.Database

  constructor(dbPath?: string) {
    const path = dbPath || join(app.getPath('userData'), 'typez.db')
    this.db = new Database(path)
    this.db.pragma('journal_mode = WAL')
    this.db.pragma('foreign_keys = ON')
    console.log('[Database] 已连接，路径:', path)
    this.initialize()
  }

  private initialize(): void {
    // 迁移：按清单顺序执行（幂等）
    this.applyMigrations()

    // 开发阶段：重置 users 表（MVP 重构）
    // 仅在开发环境且显式启用 RESET_USERS 时重置，默认不重置
    const isDevelopment = process.env.NODE_ENV === 'development'
    const shouldResetUsers = process.env.RESET_USERS === 'true'
    if (isDevelopment && shouldResetUsers) {
      console.log('[Database] RESET_USERS=true，重置 users 表')
      this.resetUsersTable()
      // 重置后触发器/FTS 可能被删除：重新执行一次幂等迁移以补齐对象
      const m003 = migrations.find((m) => m.id === '003_im_core_extensions')
      if (m003) m003.run(this.db)
    }
  }

  private applyMigrations(): void {
    // 迁移记录表：避免重复执行
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id TEXT PRIMARY KEY,
        applied_at INTEGER NOT NULL
      );
    `)

    const appliedRows = this.db.prepare('SELECT id FROM schema_migrations').all() as Array<{
      id: string
    }>
    const applied = new Set(appliedRows.map((r) => r.id))

    const now = Date.now()
    const runAll = this.db.transaction(() => {
      for (const m of migrations) {
        const shouldRun = m.shouldRun ? m.shouldRun() : true
        if (!shouldRun) continue
        if (applied.has(m.id)) continue

        console.log('[Database] apply migration:', m.id)
        m.run(this.db)
        this.db
          .prepare('INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)')
          .run(m.id, now)
      }
    })

    runAll()
  }

  /**
   * 重置 users 表（仅开发阶段使用）
   */
  private resetUsersTable(): void {
    try {
      // 注意：该操作可能导致外键引用不一致，因此仅用于开发阶段
      this.db.pragma('foreign_keys = OFF')
      this.db.exec(`
        DROP TABLE IF EXISTS users;
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          display_name TEXT NOT NULL,
          password TEXT NOT NULL,
          avatar_url TEXT,
          phone TEXT,
          bio TEXT,
          status TEXT NOT NULL DEFAULT 'offline' CHECK(status IN ('online', 'offline', 'away', 'busy')),
          kind TEXT NOT NULL DEFAULT 'human' CHECK(kind IN ('human', 'bot', 'system')),
          deleted_at INTEGER,
          last_seen INTEGER NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
      `)
      this.db.pragma('foreign_keys = ON')
      console.log('[Database] Users 表已重置（开发模式）')
    } catch (error) {
      console.error('[Database] 重置 users 表失败:', error)
    }
  }

  /**
   * 查询数据
   */
  query(params: QueryParams): QueryResult {
    let sql = `SELECT * FROM ${params.table}`
    const values: unknown[] = []

    // WHERE 条件
    if (params.where) {
      const conditions = Object.entries(params.where).map(([key]) => {
        values.push(params.where![key])
        return `${key} = ?`
      })
      sql += ` WHERE ${conditions.join(' AND ')}`
    }

    // ORDER BY
    if (params.orderBy) {
      sql += ` ORDER BY ${params.orderBy.field} ${params.orderBy.direction.toUpperCase()}`
    }

    // LIMIT & OFFSET
    if (params.limit) {
      sql += ` LIMIT ${params.limit}`
    }
    if (params.offset) {
      sql += ` OFFSET ${params.offset}`
    }

    const stmt = this.db.prepare(sql)
    const rows = stmt.all(...values)

    return {
      rows,
      total: rows.length
    }
  }

  /**
   * 插入数据
   */
  insert(params: InsertParams): InsertResult {
    const keys = Object.keys(params.data)
    const values = Object.values(params.data)
    const placeholders = keys.map(() => '?').join(', ')

    const sql = `INSERT INTO ${params.table} (${keys.join(', ')}) VALUES (${placeholders})`
    const stmt = this.db.prepare(sql)
    const result = stmt.run(...values)

    return {
      id: result.lastInsertRowid.toString(),
      rowsAffected: result.changes
    }
  }

  /**
   * 更新数据
   */
  update(params: {
    table: string
    data: Record<string, unknown>
    where: Record<string, unknown>
  }): { rowsAffected: number } {
    const setClause = Object.keys(params.data)
      .map((key) => `${key} = ?`)
      .join(', ')
    const whereClause = Object.keys(params.where)
      .map((key) => `${key} = ?`)
      .join(' AND ')

    const values = [...Object.values(params.data), ...Object.values(params.where)]
    const sql = `UPDATE ${params.table} SET ${setClause} WHERE ${whereClause}`

    const stmt = this.db.prepare(sql)
    const result = stmt.run(...values)

    return { rowsAffected: result.changes }
  }

  /**
   * 删除数据
   */
  delete(params: { table: string; where: Record<string, unknown> }): { rowsAffected: number } {
    const whereClause = Object.keys(params.where)
      .map((key) => `${key} = ?`)
      .join(' AND ')
    const values = Object.values(params.where)

    const sql = `DELETE FROM ${params.table} WHERE ${whereClause}`
    const stmt = this.db.prepare(sql)
    const result = stmt.run(...values)

    return { rowsAffected: result.changes }
  }

  /**
   * 执行任意 SQL（无返回）
   */
  exec(sql: string): void {
    this.db.exec(sql)
  }

  /**
   * 执行任意 SQL 并返回多行
   */
  rawAll<T = unknown>(sql: string, params?: unknown[]): T[] {
    const stmt = this.db.prepare(sql)
    return (params ? stmt.all(...params) : stmt.all()) as T[]
  }

  /**
   * 执行任意 SQL 并返回单行
   */
  rawGet<T = unknown>(sql: string, params?: unknown[]): T | undefined {
    const stmt = this.db.prepare(sql)
    return (params ? stmt.get(...params) : stmt.get()) as T | undefined
  }

  /**
   * 执行任意 SQL 并返回 changes 等信息
   */
  rawRun(sql: string, params?: unknown[]): { rowsAffected: number } {
    const stmt = this.db.prepare(sql)
    const result = params ? stmt.run(...params) : stmt.run()
    return { rowsAffected: result.changes }
  }

  /**
   * 在同一连接上执行事务（用于多表原子操作）
   */
  transaction<T>(fn: () => T): T {
    const tx = this.db.transaction(fn)
    return tx()
  }

  close(): void {
    this.db.close()
  }
}
