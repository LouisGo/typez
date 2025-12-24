import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import type { QueryParams, QueryResult, InsertParams, InsertResult } from '@sdk/contract'

/**
 * Initial database schema SQL
 */
const INIT_SQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  status TEXT NOT NULL DEFAULT 'offline' CHECK(status IN ('online', 'offline', 'away', 'busy')),
  last_seen INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('private', 'group', 'channel')),
  title TEXT,
  avatar_url TEXT,
  description TEXT,
  member_count INTEGER NOT NULL DEFAULT 1,
  last_message_id TEXT,
  last_message_at INTEGER,
  pinned INTEGER NOT NULL DEFAULT 0,
  muted INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('text', 'image', 'video', 'file', 'audio', 'voice')),
  reply_to_id TEXT,
  forwarded_from_id TEXT,
  edited INTEGER NOT NULL DEFAULT 0,
  read INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (reply_to_id) REFERENCES messages(id) ON DELETE SET NULL
);

-- Chat members table
CREATE TABLE IF NOT EXISTS chat_members (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK(role IN ('owner', 'admin', 'member')),
  joined_at INTEGER NOT NULL,
  left_at INTEGER,
  FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(chat_id, user_id)
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  contact_user_id TEXT NOT NULL,
  nickname TEXT,
  blocked INTEGER NOT NULL DEFAULT 0,
  favorite INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, contact_user_id)
);

-- Media table
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('image', 'video', 'file', 'audio')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  duration INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

-- App state table (singleton state)
CREATE TABLE IF NOT EXISTS app_state (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_chat_id ON chat_members(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_user_id ON chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_media_message_id ON media(message_id);
`

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
    console.log('[Database] 已连接，路径:', path)
    this.initialize()
  }

  private initialize(): void {
    // 运行迁移脚本
    this.db.exec(INIT_SQL)

    // 开发阶段：重置 users 表（MVP 重构）
    // 仅在开发环境且显式启用 RESET_USERS 时重置，默认不重置
    const isDevelopment = process.env.NODE_ENV === 'development'
    const shouldResetUsers = process.env.RESET_USERS === 'true'
    if (isDevelopment && shouldResetUsers) {
      console.log('[Database] RESET_USERS=true，重置 users 表')
      this.resetUsersTable()
    }
  }

  /**
   * 重置 users 表（仅开发阶段使用）
   */
  private resetUsersTable(): void {
    try {
      // 读取重置迁移脚本
      const resetSQL = `
        -- 删除旧表（如果存在）
        DROP TABLE IF EXISTS users;

        -- 重新创建 users 表
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          display_name TEXT NOT NULL,
          password TEXT NOT NULL,
          avatar_url TEXT,
          phone TEXT,
          bio TEXT,
          status TEXT NOT NULL DEFAULT 'offline' CHECK(status IN ('online', 'offline', 'away', 'busy')),
          last_seen INTEGER NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
      `
      this.db.exec(resetSQL)
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

  close(): void {
    this.db.close()
  }
}
