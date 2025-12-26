-- ============================================
-- Reset Users Table Migration
-- ============================================
-- 删除并重建 users 表，用于开发阶段的 MVP 重构

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
  kind TEXT NOT NULL DEFAULT 'human' CHECK(kind IN ('human', 'bot', 'system')),
  deleted_at INTEGER,
  last_seen INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

