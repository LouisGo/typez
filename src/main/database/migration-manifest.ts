import type Database from 'better-sqlite3'
import m001 from './migrations/001_init.sql?raw'
import m002 from './migrations/002_fix_fts_triggers.sql?raw'

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

export const migrations: Migration[] = [
  // 全新开始：只保留一次性初始化 schema
  { id: '001_init', run: (db) => db.exec(m001) },
  // 修复 FTS 触发器，避免在更新无关字段时触发
  { id: '002_fix_fts_triggers', run: (db) => db.exec(m002) }
]
