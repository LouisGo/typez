import type Database from 'better-sqlite3'
import m001 from './migrations/001_init.sql?raw'

export type Migration = {
  id: string
  /**
   * 迁移执行函数：尽量保持幂等（对已升级过的库重复执行不会破坏）。
   */
  run: (db: Database.Database) => void
  /**
   * 是否执行该 migration。
   * 用于开发阶段可选脚本（例如重置数据），默认 true。
   */
  shouldRun?: () => boolean
}

function hasColumn(db: Database.Database, input: { table: string; column: string }): boolean {
  const rows = db.prepare(`PRAGMA table_info(${input.table})`).all() as Array<{ name: string }>
  return rows.some((r) => r.name === input.column)
}

function ensure003(db: Database.Database): void {
  // ---- Users extensions ----
  if (!hasColumn(db, { table: 'users', column: 'kind' })) {
    db.exec(
      "ALTER TABLE users ADD COLUMN kind TEXT NOT NULL DEFAULT 'human' CHECK(kind IN ('human', 'bot', 'system'));"
    )
  }
  if (!hasColumn(db, { table: 'users', column: 'deleted_at' })) {
    db.exec('ALTER TABLE users ADD COLUMN deleted_at INTEGER;')
  }

  // ---- Chats extensions ----
  if (!hasColumn(db, { table: 'chats', column: 'created_by' })) {
    db.exec('ALTER TABLE chats ADD COLUMN created_by TEXT;')
  }
  if (!hasColumn(db, { table: 'chats', column: 'metadata' })) {
    db.exec('ALTER TABLE chats ADD COLUMN metadata TEXT;')
  }
  if (!hasColumn(db, { table: 'chats', column: 'deleted_at' })) {
    db.exec('ALTER TABLE chats ADD COLUMN deleted_at INTEGER;')
  }

  // ---- Messages extensions ----
  if (!hasColumn(db, { table: 'messages', column: 'client_id' })) {
    db.exec('ALTER TABLE messages ADD COLUMN client_id TEXT;')
  }
  if (!hasColumn(db, { table: 'messages', column: 'status' })) {
    db.exec(
      "ALTER TABLE messages ADD COLUMN status TEXT NOT NULL DEFAULT 'sent' CHECK(status IN ('sending', 'sent', 'failed'));"
    )
  }
  if (!hasColumn(db, { table: 'messages', column: 'edited_at' })) {
    db.exec('ALTER TABLE messages ADD COLUMN edited_at INTEGER;')
  }
  if (!hasColumn(db, { table: 'messages', column: 'deleted_at' })) {
    db.exec('ALTER TABLE messages ADD COLUMN deleted_at INTEGER;')
  }

  // ---- Contact requests ----
  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_requests (
      id TEXT PRIMARY KEY,
      from_user_id TEXT NOT NULL,
      to_user_id TEXT NOT NULL,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected', 'cancelled')),
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(from_user_id, to_user_id)
    );
    CREATE INDEX IF NOT EXISTS idx_contact_requests_to_user_id ON contact_requests(to_user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_contact_requests_from_user_id ON contact_requests(from_user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status);
  `)

  // ---- Per-user chat settings ----
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_user_settings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      chat_id TEXT NOT NULL,
      pinned INTEGER NOT NULL DEFAULT 0,
      muted INTEGER NOT NULL DEFAULT 0,
      archived INTEGER NOT NULL DEFAULT 0,
      last_read_message_id TEXT,
      last_read_at INTEGER,
      unread_count INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
      UNIQUE(user_id, chat_id)
    );
    CREATE INDEX IF NOT EXISTS idx_chat_user_settings_user_id ON chat_user_settings(user_id);
    CREATE INDEX IF NOT EXISTS idx_chat_user_settings_chat_id ON chat_user_settings(chat_id);
  `)

  // ---- Message receipts ----
  db.exec(`
    CREATE TABLE IF NOT EXISTS message_receipts (
      id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      delivered_at INTEGER,
      read_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(message_id, user_id)
    );
    CREATE INDEX IF NOT EXISTS idx_message_receipts_user_id ON message_receipts(user_id, updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_message_receipts_message_id ON message_receipts(message_id);
  `)

  // ---- Search (FTS5) ----
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts
    USING fts5(
      content,
      chat_id UNINDEXED,
      sender_id UNINDEXED,
      message_id UNINDEXED,
      tokenize = 'unicode61'
    );

    CREATE TRIGGER IF NOT EXISTS trg_messages_fts_ai AFTER INSERT ON messages BEGIN
      INSERT INTO messages_fts(rowid, content, chat_id, sender_id, message_id)
      VALUES (new.rowid, new.content, new.chat_id, new.sender_id, new.id);
    END;

    CREATE TRIGGER IF NOT EXISTS trg_messages_fts_ad AFTER DELETE ON messages BEGIN
      INSERT INTO messages_fts(messages_fts, rowid, content, chat_id, sender_id, message_id)
      VALUES ('delete', old.rowid, old.content, old.chat_id, old.sender_id, old.id);
    END;

    CREATE TRIGGER IF NOT EXISTS trg_messages_fts_au AFTER UPDATE ON messages BEGIN
      INSERT INTO messages_fts(messages_fts, rowid, content, chat_id, sender_id, message_id)
      VALUES ('delete', old.rowid, old.content, old.chat_id, old.sender_id, old.id);
      INSERT INTO messages_fts(rowid, content, chat_id, sender_id, message_id)
      VALUES (new.rowid, new.content, new.chat_id, new.sender_id, new.id);
    END;

    CREATE VIRTUAL TABLE IF NOT EXISTS users_fts
    USING fts5(
      username,
      display_name,
      user_id UNINDEXED,
      tokenize = 'unicode61'
    );

    CREATE TRIGGER IF NOT EXISTS trg_users_fts_ai AFTER INSERT ON users BEGIN
      INSERT INTO users_fts(rowid, username, display_name, user_id)
      VALUES (new.rowid, new.username, new.display_name, new.id);
    END;

    CREATE TRIGGER IF NOT EXISTS trg_users_fts_ad AFTER DELETE ON users BEGIN
      INSERT INTO users_fts(users_fts, rowid, username, display_name, user_id)
      VALUES ('delete', old.rowid, old.username, old.display_name, old.id);
    END;

    CREATE TRIGGER IF NOT EXISTS trg_users_fts_au AFTER UPDATE ON users BEGIN
      INSERT INTO users_fts(users_fts, rowid, username, display_name, user_id)
      VALUES ('delete', old.rowid, old.username, old.display_name, old.id);
      INSERT INTO users_fts(rowid, username, display_name, user_id)
      VALUES (new.rowid, new.username, new.display_name, new.id);
    END;
  `)
}

export const migrations: Migration[] = [
  { id: '001_init', run: (db) => db.exec(m001) },
  { id: '003_im_core_extensions', run: ensure003 }
]
