/**
 * Database Connection — Singleton
 *
 * Opens the SQLite database once and initialises the schema.
 * Call `initDB()` once at application startup (App.tsx).
 */

import {open, DB} from '@op-engineering/op-sqlite';
import {
  CREATE_TABLES_V1,
  CURRENT_DB_VERSION,
} from './schema';
import {SYRIAN_CITIES} from '../constants/syrianCities';

let _db: DB | null = null;

/**
 * Returns the open database instance.
 * Throws if initDB() has not been called yet.
 */
export function getDB(): DB {
  if (!_db) {
    throw new Error(
      '[DB] Database not initialised. Call initDB() in App.tsx first.',
    );
  }
  return _db;
}

/**
 * Initialises the SQLite database.
 * - Opens (or creates) `easysy.db`.
 * - Runs schema migrations via USER_VERSION pragma.
 * - Seeds static data (cities) on first run.
 *
 * Safe to call multiple times — idempotent.
 */
export async function initDB(): Promise<void> {
  if (_db) {
    return; // Already initialised
  }

  _db = open({name: 'easysy.db'});

  // Read current schema version
  const versionResult = _db.executeSync('PRAGMA user_version');
  const currentVersion: number =
    (versionResult.rows?.[0]?.user_version as number) ?? 0;

  // Run v1 migrations block synchronously.
  // Using IF NOT EXISTS makes it safe to run unconditionally during dev.
  _db.executeSync('BEGIN TRANSACTION');
  try {
    for (const sql of CREATE_TABLES_V1) {
      _db.executeSync(sql);
    }
    _db.executeSync('COMMIT');
  } catch (e) {
    _db.executeSync('ROLLBACK');
    console.error('[DB] Failed to create tables:', e);
  }

  if (currentVersion < 1) {
    _db.executeSync(`PRAGMA user_version = ${CURRENT_DB_VERSION}`);
    // Seed static city data on fresh install
    await _seedCities();
  }

  // Future migrations go here:
  // if (currentVersion < 2) { ... }
}

/**
 * Seeds the cities table with static data.
 * Only called once on first install (v0 → v1 migration).
 */
async function _seedCities(): Promise<void> {
  if (!_db) {return;}
  _db.transaction(async (tx: any) => {
    for (const city of SYRIAN_CITIES) {
      tx.executeSync(
        `INSERT OR IGNORE INTO cities (name_en, name_ar, name_tr, country_en)
         VALUES (?, ?, ?, ?)`,
        [city.name_en, city.name_ar, city.name_tr, city.country_en],
      );
    }
  });
}
