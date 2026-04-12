/**
 * Favorites DAO
 *
 * Fully offline feature — user favorites are stored locally only.
 * No API call, no TTL. Data persists until the user removes it.
 */

import {getDB} from './db';

export const favoritesDao = {
  /**
   * Adds a hotel to favorites.
   */
  add(hotelId: string): void {
    const db = getDB();
    db.executeSync(
      `INSERT OR IGNORE INTO user_favorites (hotel_id, added_at) VALUES (?, ?)`,
      [hotelId, Date.now()],
    );
  },

  /**
   * Removes a hotel from favorites.
   */
  remove(hotelId: string): void {
    const db = getDB();
    db.executeSync(
      'DELETE FROM user_favorites WHERE hotel_id = ?',
      [hotelId],
    );
  },

  /**
   * Returns all favorited hotel IDs, most recently added first.
   */
  getAll(): string[] {
    const db = getDB();
    const result = db.executeSync(
      'SELECT hotel_id FROM user_favorites ORDER BY added_at DESC',
    );
    return (result.rows ?? []).map((r: any) => r.hotel_id as string);
  },

  /**
   * Checks whether a specific hotel is favorited.
   */
  isFavorite(hotelId: string): boolean {
    const db = getDB();
    const result = db.executeSync(
      'SELECT 1 FROM user_favorites WHERE hotel_id = ? LIMIT 1',
      [hotelId],
    );
    return (result.rows?.length ?? 0) > 0;
  },

  /**
   * Returns the total count of favorites.
   */
  count(): number {
    const db = getDB();
    const result = db.executeSync(
      'SELECT COUNT(*) as total FROM user_favorites',
    );
    return (result.rows?.[0]?.total as number) ?? 0;
  },
};
