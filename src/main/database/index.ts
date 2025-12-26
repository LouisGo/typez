import Database from 'better-sqlite3'
import { app } from 'electron'
import { existsSync, unlinkSync } from 'fs'
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
    // 全新开始：使用新库文件，同时清理旧库文件（旧数据彻底丢弃）
    const userDataDir = app.getPath('userData')
    const path = dbPath || join(userDataDir, 'typez.v2.db')

    // 删除旧库（typez.db + wal/shm），避免残留数据影响使用
    // 注意：只清理旧文件名，不删除当前 v2 库
    this.tryDeleteLegacyDbFiles(userDataDir)

    this.db = new Database(path)
    this.db.pragma('journal_mode = WAL')
    this.db.pragma('foreign_keys = ON')
    console.log('[Database] 已连接，路径:', path)
    this.initialize()
  }

  private initialize(): void {
    // 迁移：按清单顺序执行（幂等）
    this.applyMigrations()
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

  private tryDeleteLegacyDbFiles(userDataDir: string): void {
    const legacyBase = join(userDataDir, 'typez.db')
    const candidates = [legacyBase, `${legacyBase}-wal`, `${legacyBase}-shm`]
    for (const file of candidates) {
      try {
        if (existsSync(file)) unlinkSync(file)
      } catch (e) {
        console.warn('[Database] Failed to delete legacy db file:', file, e)
      }
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

    try {
      const stmt = this.db.prepare(sql)
      const result = stmt.run(...values)
      return { rowsAffected: result.changes }
    } catch (error) {
      console.error('[Database] UPDATE failed:', error)
      console.error('[Database] SQL:', sql)
      console.error('[Database] Values:', values)
      throw error
    }
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
