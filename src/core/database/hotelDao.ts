/**
 * Hotel DAO (Data Access Object)
 *
 * Handles all SQLite read/write operations for hotel data.
 * Upper layers (repository) call this; they never touch SQL directly.
 *
 * TTL default: 30 minutes.
 */

import {getDB} from './db';
import {Hotel, HotelReview} from '../../features/hotels/models/Hotel';

const DEFAULT_TTL_MS = 30 * 60 * 1000; // 30 minutes

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function now(): number {
  return Date.now();
}

function isStale(cachedAt: number, ttlMs: number = DEFAULT_TTL_MS): boolean {
  return now() - cachedAt > ttlMs;
}

// ---------------------------------------------------------------------------
// Hotel records
// ---------------------------------------------------------------------------

export const hotelDao = {
  /**
   * Checks whether a hotel cache record is still fresh.
   */
  isHotelFresh(hotelId: string): boolean {
    const db = getDB();
    const result = db.executeSync(
      'SELECT cached_at FROM hotels WHERE id = ?',
      [hotelId],
    );
    const row = result.rows?.[0];
    if (!row) {return false;}
    return !isStale(row.cached_at as number);
  },

  /**
   * Fetches a single hotel from the local DB.
   * Returns null if not cached or stale.
   */
  getById(hotelId: string): Hotel | null {
    const db = getDB();
    const result = db.executeSync(
      'SELECT json_data, cached_at FROM hotels WHERE id = ?',
      [hotelId],
    );
    const row = result.rows?.[0];
    if (!row) {return null;}
    if (isStale(row.cached_at as number)) {return null;}
    return JSON.parse(row.json_data as string) as Hotel;
  },

  /**
   * Fetches hotels by search key + page from the hotel_searches join.
   * Returns null if the search cache is stale or missing.
   */
  getBySearchKey(searchKey: string): Hotel[] | null {
    const db = getDB();
    const searchResult = db.executeSync(
      'SELECT result_ids, cached_at FROM hotel_searches WHERE search_key = ?',
      [searchKey],
    );
    const searchRow = searchResult.rows?.[0];
    if (!searchRow) {return null;}
    if (isStale(searchRow.cached_at as number)) {return null;}

    const ids: string[] = JSON.parse(searchRow.result_ids as string);
    if (ids.length === 0) {return [];}

    // Fetch each hotel record by id
    const placeholders = ids.map(() => '?').join(',');
    const hotelsResult = db.executeSync(
      `SELECT json_data FROM hotels WHERE id IN (${placeholders})`,
      ids,
    );

    const hotelMap = new Map<string, Hotel>();
    for (const row of hotelsResult.rows ?? []) {
      const hotel = JSON.parse(row.json_data as string) as Hotel;
      hotelMap.set(hotel.id, hotel);
    }

    // Preserve original order from result_ids
    return ids
      .map(id => hotelMap.get(id))
      .filter((h): h is Hotel => h !== undefined);
  },

  /**
   * Saves a batch of hotels and records the search → id mapping.
   * Wrapped in a single transaction for atomicity & performance.
   */
  insertSearchResult(searchKey: string, hotels: Hotel[]): void {
    const db = getDB();
    const timestamp = now();

    db.transaction(async (tx: any) => {
      // Upsert each hotel
      for (const hotel of hotels) {
        tx.executeSync(
          `INSERT OR REPLACE INTO hotels (id, json_data, city, cached_at)
           VALUES (?, ?, ?, ?)`,
          [hotel.id, JSON.stringify(hotel), hotel.city, timestamp],
        );
      }

      // Upsert the search → id mapping
      const ids = hotels.map(h => h.id);
      tx.executeSync(
        `INSERT OR REPLACE INTO hotel_searches (search_key, result_ids, cached_at)
         VALUES (?, ?, ?)`,
        [searchKey, JSON.stringify(ids), timestamp],
      );
    });
  },

  /**
   * Saves a single hotel (e.g., fetched for detail view).
   */
  insertHotel(hotel: Hotel): void {
    const db = getDB();
    db.executeSync(
      `INSERT OR REPLACE INTO hotels (id, json_data, city, cached_at)
       VALUES (?, ?, ?, ?)`,
      [hotel.id, JSON.stringify(hotel), hotel.city, now()],
    );
  },

  /**
   * Invalidates all search caches for a given location.
   * Call this when you want to force a fresh API fetch.
   */
  invalidateSearches(): void {
    const db = getDB();
    db.executeSync('DELETE FROM hotel_searches');
  },
};

// ---------------------------------------------------------------------------
// Hotel reviews
// ---------------------------------------------------------------------------

export const reviewDao = {
  get(hotelId: string): HotelReview[] | null {
    const db = getDB();
    const result = db.executeSync(
      'SELECT json_data, cached_at FROM hotel_reviews WHERE hotel_id = ?',
      [hotelId],
    );
    const row = result.rows?.[0];
    if (!row) {return null;}
    if (isStale(row.cached_at as number)) {return null;}
    return JSON.parse(row.json_data as string) as HotelReview[];
  },

  insert(hotelId: string, reviews: HotelReview[]): void {
    const db = getDB();
    db.executeSync(
      `INSERT OR REPLACE INTO hotel_reviews (hotel_id, json_data, cached_at)
       VALUES (?, ?, ?)`,
      [hotelId, JSON.stringify(reviews), now()],
    );
  },
};

// ---------------------------------------------------------------------------
// Dynamic Location Search (from API cache)
// ---------------------------------------------------------------------------

export const locationDao = {
  getLocations(): any[] | null {
    const db = getDB();
    const result = db.executeSync(
      'SELECT result_ids, cached_at FROM hotel_searches WHERE search_key = ?',
      ['all_locations'],
    );
    const row = result.rows?.[0];
    if (!row) {return null;}
    // 24 hours TTL for locations
    if (isStale(row.cached_at as number, 24 * 60 * 60 * 1000)) {return null;}
    return JSON.parse(row.result_ids as string);
  },

  insertLocations(locations: any[]): void {
    const db = getDB();
    db.executeSync(
      `INSERT OR REPLACE INTO hotel_searches (search_key, result_ids, cached_at)
       VALUES (?, ?, ?)`,
      ['all_locations', JSON.stringify(locations), now()],
    );
  },
};
