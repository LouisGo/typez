-- ============================================
-- Initial Database Schema (Fresh Start)
-- ============================================

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
  kind TEXT NOT NULL DEFAULT 'human' CHECK(kind IN ('human', 'bot', 'system')),
  deleted_at INTEGER,
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
  created_by TEXT,
  metadata TEXT,
  deleted_at INTEGER,
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
  client_id TEXT,
  status TEXT NOT NULL DEFAULT 'sent' CHECK(status IN ('sending', 'sent', 'failed')),
  edited_at INTEGER,
  deleted_at INTEGER,
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

-- Contact requests (friend request workflow)
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

-- Per-user chat settings
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

-- Message receipts
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

-- Search (FTS5)
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

CREATE TRIGGER IF NOT EXISTS trg_messages_fts_au AFTER UPDATE OF content ON messages BEGIN
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

CREATE TRIGGER IF NOT EXISTS trg_users_fts_au AFTER UPDATE OF username, display_name ON users BEGIN
  INSERT INTO users_fts(users_fts, rowid, username, display_name, user_id)
  VALUES ('delete', old.rowid, old.username, old.display_name, old.id);
  INSERT INTO users_fts(rowid, username, display_name, user_id)
  VALUES (new.rowid, new.username, new.display_name, new.id);
END;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_chat_id ON chat_members(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_user_id ON chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_media_message_id ON media(message_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_to_user_id ON contact_requests(to_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_requests_from_user_id ON contact_requests(from_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status);
CREATE INDEX IF NOT EXISTS idx_chat_user_settings_user_id ON chat_user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_user_settings_chat_id ON chat_user_settings(chat_id);
CREATE INDEX IF NOT EXISTS idx_message_receipts_user_id ON message_receipts(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_receipts_message_id ON message_receipts(message_id);
