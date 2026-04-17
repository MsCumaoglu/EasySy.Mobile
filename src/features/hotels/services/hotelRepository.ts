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

import {hotelDao, reviewDao, locationDao} from '../../../core/database/hotelDao';
import {hotelService, HotelSearchResultItem} from '../../../core/api/services/hotelService';
import {hotelMockService} from './hotelMockService';
import {Hotel, HotelAmenity, HotelReview} from '../models/Hotel';
import {HotelSearchParams} from '../types/hotelTypes';
import i18n from '../../../localization/i18n';

export const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Amenity key mapping: backend slug → app HotelAmenity
// ---------------------------------------------------------------------------

const AMENITY_MAP: Record<string, HotelAmenity> = {
  free_wifi:          'wifi',
  wifi:               'wifi',
  restaurant:         'restaurant',
  swimming_pool:      'pool',
  pool:               'pool',
  spa:                'spa',
  gym:                'gym',
  fitness_center:     'gym',
  breakfast_included: 'breakfast',
  breakfast:          'breakfast',
  parking:            'parking',
  valet_parking:      'parking',
  free_parking:       'parking',
  air_conditioning:   'ac',
  ac:                 'ac',
};

function mapAmenities(raw: any[]): HotelAmenity[] {
  const result: HotelAmenity[] = [];
  for (const item of raw) {
    let key = '';
    if (typeof item === 'string') {
      key = item;
    } else if (item && typeof item === 'object') {
      key = item.amenityKey || item.key || '';
    }

    if (key) {
      const mapped = AMENITY_MAP[key.toLowerCase()];
      if (mapped && !result.includes(mapped)) {
        result.push(mapped);
      }
    }
  }
  return result;
}

function localizeHotel(hotel: Hotel): Hotel {
  const lang = i18n.language;
  const isAr = lang === 'ar';
  const isTr = lang === 'tr';

  return {
    ...hotel,
    name: isAr ? (hotel.nameAr || hotel.nameEn || hotel.name) : isTr ? (hotel.nameTr || hotel.nameEn || hotel.name) : (hotel.nameEn || hotel.nameAr || hotel.name),
    description: isAr ? (hotel.descriptionAr || hotel.descriptionEn || hotel.description) : isTr ? (hotel.descriptionTr || hotel.descriptionEn || hotel.description) : (hotel.descriptionEn || hotel.descriptionAr || hotel.description),
    location: isAr ? (hotel.addressAr || hotel.location) : isTr ? (hotel.addressTr || hotel.location) : (hotel.addressEn || hotel.location),
    city: isAr ? (hotel.cityAr || hotel.city) : isTr ? (hotel.cityTr || hotel.city) : (hotel.cityEn || hotel.city),
    policy: hotel.policy ? {
      ...hotel.policy,
      cancellationPolicy: isAr 
        ? (hotel.policy.cancellationPolicyAr || hotel.policy.cancellationPolicyEn || hotel.policy.cancellationPolicy) 
        : isTr 
        ? (hotel.policy.cancellationPolicyTr || hotel.policy.cancellationPolicyEn || hotel.policy.cancellationPolicy)
        : (hotel.policy.cancellationPolicyEn || hotel.policy.cancellationPolicyAr || hotel.policy.cancellationPolicy),
    } : undefined,
  };
}

function mapCategory(propertyType: string, stars: number): Hotel['category'] {
  const type = propertyType.toUpperCase();
  if (type === 'RESORT') { return 'resort'; }
  if (type === 'HOTEL' && stars >= 4) { return 'luxury'; }
  if (type === 'HOTEL') { return 'business'; }
  return 'budget';
}

function mapApiHotel(item: HotelSearchResultItem): Hotel {
  const hotel: Hotel = {
    id:          item.id,
    name:        item.name,  // Already localized by backend via Accept-Language
    location:    `${item.city}, ${item.district}`,
    city:        item.city,
    country:     'Syria',
    rating:      item.avgRating,
    reviewCount: item.totalReviews,
    priceMin:    item.pricePerNight,
    priceMax:    item.pricePerNight,
    currency:    'SYP',
    images:      item.primaryImageUrl ? [item.primaryImageUrl] : [],
    amenities:   mapAmenities(item.amenities ?? []),
    description: '',
    coordinates: {latitude: 0, longitude: 0},
    category:    mapCategory(item.propertyType, item.starRating),
  };
  return hotel;
}

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
    let cached: Hotel[] | null = null;
    try {
      cached = hotelDao.getBySearchKey(cacheKey);
    } catch (e) {
      console.warn('[DB Error] Failed to read from cache, falling back to API:', e);
    }
    
    if (cached !== null) {
      return cached.map(localizeHotel);
    }

    // 2. Cache miss or stale → fetch ALL from service (mock returns full list)
    //    Then paginate in-memory. When real API supports pagination, pass
    //    page+limit directly to the endpoint instead.
    // 2. Cache miss → fetch from real API
    const apiItems = await hotelService.searchHotels({
      city:     params.location || undefined,
      checkIn:  params.checkIn  || '',
      checkOut: params.checkOut || '',
      adults:   params.guests   || 1,
      rooms:    params.rooms    || 1,
    });

    const allHotels: Hotel[] = apiItems.map(mapApiHotel);

    // Client-side pagination (remove when server implements LIMIT/OFFSET)
    const start = (page - 1) * PAGE_SIZE;
    const pageData = allHotels.slice(start, start + PAGE_SIZE);

    // 3. Persist full hotel records + search mapping to SQLite
    if (pageData.length > 0) {
      try {
        hotelDao.insertSearchResult(cacheKey, pageData);
      } catch (e) {
        console.warn('[DB Error] Failed to cache results:', e);
      }
    }

    return pageData.map(localizeHotel);
  },

  /**
   * Fetch a single hotel by ID.
   * Tries local DB first; falls back to API if not cached.
   */
  async getHotelById(id: string): Promise<Hotel | null> {
    // 1. Try local cache
    const cached = hotelDao.getById(id);
    
    // Use cache only if it has full detail data (description + images)
    if (cached && cached.description && cached.images.length > 0) {
      return localizeHotel(cached);
    }

    // 2. Cache miss → fetch from real API service
    try {
      const d = await hotelService.getHotelDetails(id);
      if (d) {
        // Extract image URLs, sorted by sortOrder
        const sortedImages = [...(d.images || [])]
          .sort((a, b) => a.sortOrder - b.sortOrder);
        const imageUrls = sortedImages
          .map(img => img.url)
          .filter(Boolean);

        // Find primary image as fallback
        const primaryImg = sortedImages.find(img => img.isPrimary);

        // Map amenity objects → app amenity keys
        const safeAmenities = mapAmenities(d.amenities || []);

        // Build location string
        const location = d.district
          ? `${d.city}, ${d.district}`
          : d.address || d.city || cached?.location || 'Unknown';

        const hotel: Hotel = {
          id: d.id || id,
          name: d.name || cached?.name || 'Unknown Hotel',
          location,
          city: d.city || cached?.city || 'Unknown',
          country: 'Syria',
          rating: d.avgRating ?? cached?.rating ?? 0,
          reviewCount: d.totalReviews ?? cached?.reviewCount ?? 0,
          priceMin: cached?.priceMin ?? 0,
          priceMax: cached?.priceMax ?? 0,
          currency: 'SYP',
          images: imageUrls.length > 0
            ? imageUrls
            : (primaryImg ? [primaryImg.url] : (cached?.images || [])),
          amenities: safeAmenities.length > 0 ? safeAmenities : (cached?.amenities || []),
          description: d.description || cached?.description || '',
          coordinates: {
            latitude: d.latitude || 0,
            longitude: d.longitude || 0,
          },
          category: mapCategory(d.propertyType || 'HOTEL', d.starRating || 3),
          policy: d.policy ? {
            checkInFrom: d.policy.checkInFrom || d.checkInTime || '14:00',
            checkInUntil: d.policy.checkInUntil || '00:00',
            checkOutUntil: d.policy.checkOutUntil || d.checkOutTime || '12:00',
            childrenAllowed: !!d.policy.childrenAllowed,
            petsAllowed: !!d.policy.petsAllowed,
            smokingAllowed: !!d.policy.smokingAllowed,
            cancellationPolicy: d.policy.cancellationPolicy || '',
          } : undefined,
        };
        hotelDao.insertHotel(hotel);
        return hotel; // Already localized by backend via Accept-Language
      }
    } catch (e) {
      console.error('[API Error] Failed to fetch hotel details:', e);
    }
    return cached ? localizeHotel(cached) : null;
  },

  /**
   * Fetch reviews for a hotel.
   * Cached for the same TTL as hotel records (30 min).
   */
  async getHotelReviews(hotelId: string): Promise<HotelReview[]> {
    // 1. Try local cache
    const cached = reviewDao.get(hotelId);
    if (cached && cached.length > 0) {
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
    if (cached && cached.length > 0) {return cached;}

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

  /**
   * Fetch available locations (cities) and their hotel counts.
   * Tries local DB first; falls back to API.
   */
  async fetchLocations(): Promise<any[]> {
    try {
      const cached = locationDao.getLocations();
      if (cached && cached.length > 0) {
        return cached;
      }
    } catch (e) {
      console.warn('[DB Error] Failed to read locations from cache:', e);
    }

    try {
      const locations = await hotelService.getLocations();
      if (locations && locations.length > 0) {
        locationDao.insertLocations(locations);
      }
      return locations;
    } catch (error) {
      console.error('[API Error] Failed to fetch locations:', error);
      return [];
    }
  },
};
