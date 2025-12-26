-- ============================================
-- Fix FTS Triggers (Only update on relevant fields)
-- ============================================

-- Drop and recreate users FTS update trigger to only fire on username/display_name changes
DROP TRIGGER IF EXISTS trg_users_fts_au;

CREATE TRIGGER trg_users_fts_au AFTER UPDATE OF username, display_name ON users BEGIN
  INSERT INTO users_fts(users_fts, rowid, username, display_name, user_id)
  VALUES ('delete', old.rowid, old.username, old.display_name, old.id);
  INSERT INTO users_fts(rowid, username, display_name, user_id)
  VALUES (new.rowid, new.username, new.display_name, new.id);
END;

-- Drop and recreate messages FTS update trigger to only fire on content changes
DROP TRIGGER IF EXISTS trg_messages_fts_au;

CREATE TRIGGER trg_messages_fts_au AFTER UPDATE OF content ON messages BEGIN
  INSERT INTO messages_fts(messages_fts, rowid, content, chat_id, sender_id, message_id)
  VALUES ('delete', old.rowid, old.content, old.chat_id, old.sender_id, old.id);
  INSERT INTO messages_fts(rowid, content, chat_id, sender_id, message_id)
  VALUES (new.rowid, new.content, new.chat_id, new.sender_id, new.id);
END;

