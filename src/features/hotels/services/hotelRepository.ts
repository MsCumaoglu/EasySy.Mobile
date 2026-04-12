/**
 * Hotel Repository — Cache-Aside Orchestrator
 *
 * This is the SINGLE source of truth for hotel data.
 * Screens and hooks never call the API or DB directly.
 *
 * Flow for every data request:
 *  1. Build a deterministic cache key.
 *  2. Check SQLite → if fresh data exists, return immediately.
 *  3. If stale / missing → fetch from API (mock in DEV, real in PROD).
 *  4. Persist API response to SQLite for future requests.
 *  5. Return the fresh data.
 */

import {hotelDao, reviewDao} from '../../../core/database/hotelDao';
import {hotelMockService} from './hotelMockService';
import {Hotel, HotelReview} from '../models/Hotel';
import {HotelSearchParams} from '../types/hotelTypes';

export const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Cache key helpers
// ---------------------------------------------------------------------------

/**
 * Builds a stable, human-readable cache key for a search query + page.
 * Example: "search:tartus:2026-05-01:2026-05-05:2:1:rooms:1:page:1"
 */
function buildSearchKey(params: Partial<HotelSearchParams>, page: number): string {
  return [
    'search',
    (params.location ?? '').toLowerCase().trim(),
    params.checkIn ?? '',
    params.checkOut ?? '',
    params.guests ?? 2,
    params.children ?? 0,
    'rooms',
    params.rooms ?? 1,
    'page',
    page,
  ].join(':');
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const hotelRepository = {
  /**
   * Search hotels with pagination.
   *
   * @param params  Search parameters (location, dates, guests…)
   * @param page    1-indexed page number
   * @returns       A page of Hotel objects (up to PAGE_SIZE items)
   */
  async searchHotels(
    params: Partial<HotelSearchParams>,
    page: number,
  ): Promise<Hotel[]> {
    const cacheKey = buildSearchKey(params, page);

    // 1. Try local cache first
    const cached = hotelDao.getBySearchKey(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // 2. Cache miss or stale → fetch ALL from service (mock returns full list)
    //    Then paginate in-memory. When real API supports pagination, pass
    //    page+limit directly to the endpoint instead.
    const allHotels = await hotelMockService.searchHotels(params);

    // Client-side pagination (remove when server implements LIMIT/OFFSET)
    const start = (page - 1) * PAGE_SIZE;
    const pageData = allHotels.slice(start, start + PAGE_SIZE);

    // 3. Persist full hotel records + search mapping to SQLite
    if (pageData.length > 0) {
      hotelDao.insertSearchResult(cacheKey, pageData);
    }

    return pageData;
  },

  /**
   * Fetch a single hotel by ID.
   * Tries local DB first; falls back to API if not cached.
   */
  async getHotelById(id: string): Promise<Hotel | null> {
    // 1. Try local cache
    const cached = hotelDao.getById(id);
    if (cached) {
      return cached;
    }

    // 2. Cache miss → fetch from service
    const hotel = await hotelMockService.getHotelById(id);
    if (hotel) {
      hotelDao.insertHotel(hotel);
    }
    return hotel;
  },

  /**
   * Fetch reviews for a hotel.
   * Cached for the same TTL as hotel records (30 min).
   */
  async getHotelReviews(hotelId: string): Promise<HotelReview[]> {
    // 1. Try local cache
    const cached = reviewDao.get(hotelId);
    if (cached) {
      return cached;
    }

    // 2. Cache miss → fetch from service
    const reviews = await hotelMockService.getHotelReviews(hotelId);
    reviewDao.insert(hotelId, reviews);
    return reviews;
  },

  /**
   * Fetch popular hotels.
   * Uses page 1 of the default search as a proxy.
   * Adjust if the API has a dedicated /popular endpoint.
   */
  async getPopularHotels(): Promise<Hotel[]> {
    const cacheKey = 'popular:page:1';
    const cached = hotelDao.getBySearchKey(cacheKey);
    if (cached) {return cached;}

    const popular = await hotelMockService.getPopularHotels();
    if (popular.length > 0) {
      hotelDao.insertSearchResult(cacheKey, popular);
    }
    return popular;
  },

  /**
   * Force-invalidates all search caches so the next request hits the API.
   * Useful after a pull-to-refresh gesture.
   */
  invalidateSearchCache(): void {
    hotelDao.invalidateSearches();
  },
};
