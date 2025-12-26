-- ============================================
-- IM Core Extensions (Contacts/Settings/Receipts/Search/Bots-ready)
-- ============================================

-- NOTE:
-- 该文件更多作为“schema 设计参考”保留。
-- 真实运行时迁移逻辑在 `src/main/database/migration-manifest.ts` 中实现，
-- 其中对 ALTER TABLE 做了列存在性检查以保证幂等（SQLite 的 ADD COLUMN 不支持 IF NOT EXISTS）。

-- ---- Contact requests (friend request workflow) ----
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

-- ---- Per-user chat settings (pinned/muted/unread/last read) ----
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

-- ---- Message receipts (delivered/read per user) ----
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

-- ---- Search (FTS5) ----
-- Message full-text search
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

-- User full-text search
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


