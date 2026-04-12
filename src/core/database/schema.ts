/**
 * Database Schema & Migration
 *
 * Migration strategy: USER_VERSION pragma.
 * When schema changes, bump CURRENT_VERSION and add a new migration block.
 */

export const CURRENT_DB_VERSION = 1;

/**
 * SQL statements to create the initial schema (v1).
 */
export const CREATE_TABLES_V1 = [
  /**
   * hotels — Cached hotel records from API.
   * json_data stores the full serialized Hotel object.
   * cached_at is a Unix timestamp (ms) used for TTL checks.
   */
  `CREATE TABLE IF NOT EXISTS hotels (
    id         TEXT PRIMARY KEY NOT NULL,
    json_data  TEXT NOT NULL,
    city       TEXT NOT NULL,
    cached_at  INTEGER NOT NULL
  )`,

  /**
   * hotel_searches — Maps a search query to a list of result hotel IDs.
   * search_key is a stable hash of HotelSearchParams + page number.
   * result_ids is a JSON array of hotel id strings.
   */
  `CREATE TABLE IF NOT EXISTS hotel_searches (
    search_key TEXT PRIMARY KEY NOT NULL,
    result_ids TEXT NOT NULL,
    cached_at  INTEGER NOT NULL
  )`,

  /**
   * hotel_reviews — Cached reviews per hotel.
   */
  `CREATE TABLE IF NOT EXISTS hotel_reviews (
    hotel_id  TEXT NOT NULL,
    json_data TEXT NOT NULL,
    cached_at INTEGER NOT NULL,
    PRIMARY KEY (hotel_id)
  )`,

  /**
   * user_favorites — Fully offline; never expires.
   */
  `CREATE TABLE IF NOT EXISTS user_favorites (
    hotel_id TEXT PRIMARY KEY NOT NULL,
    added_at INTEGER NOT NULL
  )`,

  /**
   * cities — Static lookup table; populated once on app init.
   * Enables instant search suggestions without any API call.
   */
  `CREATE TABLE IF NOT EXISTS cities (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name_en    TEXT NOT NULL,
    name_ar    TEXT,
    name_tr    TEXT,
    country_en TEXT NOT NULL
  )`,

  // Fast lookup indexes
  `CREATE INDEX IF NOT EXISTS idx_hotels_city ON hotels(city)`,
  `CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name_en)`,
];
