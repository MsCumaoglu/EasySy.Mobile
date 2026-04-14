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
    name:        item.nameEn, // Default, will be localized
    nameEn:      item.nameEn,
    nameAr:      item.nameAr,
    nameTr:      item.nameTr,
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
    
    // We want to force fetch detail if localization fields are missing (old cache) or description is empty
    if (cached && cached.description && cached.images.length > 0 && (cached.nameAr || cached.nameEn)) {
      return localizeHotel(cached);
    }

    // 2. Cache miss → fetch from real API service
    try {
      const detailResponse = await hotelService.getHotelDetails(id);
      if (detailResponse) {
        const price = detailResponse.rooms?.[0]?.pricePerNight ?? cached?.priceMin ?? 0;
        
        let city = cached?.city || '';
        const loc = detailResponse.location || detailResponse.address;
        if (typeof loc === 'string') {
           city = loc.split(',')[0];
        }

        let safeImages: string[] = cached?.images || [];
        if (Array.isArray(detailResponse.images) && detailResponse.images.length > 0) {
          safeImages = detailResponse.images.map((img: any) => {
            if (typeof img === 'string') return img;
            if (img && typeof img === 'object') {
              return img.url || img.uri || img.path || img.imageUrl || '';
            }
            return '';
          }).filter(Boolean);
        }
        if (safeImages.length === 0) {
          safeImages = cached?.images || [];
        }

        const rawAmenities = Array.isArray(detailResponse.amenities) ? detailResponse.amenities : [];
        const safeAmenities = rawAmenities.length > 0 
          ? mapAmenities(rawAmenities) 
          : (cached?.amenities || []);

        const hotel: Hotel = {
          id: detailResponse.id || id,
          name: detailResponse.nameEn || detailResponse.name || cached?.name || 'Unknown Hotel',
          nameEn: detailResponse.nameEn,
          nameAr: detailResponse.nameAr,
          nameTr: detailResponse.nameTr,
          location: typeof loc === 'string' ? loc : (detailResponse.district ? `${detailResponse.city}, ${detailResponse.district}` : (cached?.location || 'Unknown Location')),
          addressEn: detailResponse.addressEn,
          addressAr: detailResponse.addressAr,
          addressTr: detailResponse.addressTr,
          city: detailResponse.city || 'Unknown',
          cityEn: detailResponse.cityEn,
          cityAr: detailResponse.cityAr,
          cityTr: detailResponse.cityTr,
          country: 'Syria',
          rating: detailResponse.avgRating ?? detailResponse.rating ?? detailResponse.stars ?? detailResponse.starRating ?? cached?.rating ?? 0,
          reviewCount: detailResponse.totalReviews ?? detailResponse.reviewCount ?? cached?.reviewCount ?? 0,
          priceMin: price || detailResponse.pricePerNight || 0,
          priceMax: price || detailResponse.pricePerNight || 0,
          currency: 'SYP',
          images: safeImages.length > 0 ? safeImages : (detailResponse.primaryImageUrl ? [detailResponse.primaryImageUrl] : []),
          amenities: safeAmenities,
          description: detailResponse.descriptionEn || detailResponse.description || '',
          descriptionEn: detailResponse.descriptionEn,
          descriptionAr: detailResponse.descriptionAr,
          descriptionTr: detailResponse.descriptionTr,
          coordinates: {latitude: detailResponse.latitude || 0, longitude: detailResponse.longitude || 0},
          category: mapCategory(detailResponse.propertyType || 'HOTEL', detailResponse.starRating || detailResponse.stars || 3),
          policy: detailResponse.policy ? {
            checkInFrom: detailResponse.policy.checkInFrom || detailResponse.checkInTime || '14:00',
            checkInUntil: detailResponse.policy.checkInUntil || '00:00',
            checkOutUntil: detailResponse.policy.checkOutUntil || detailResponse.checkOutTime || '12:00',
            childrenAllowed: !!detailResponse.policy.childrenAllowed,
            petsAllowed: !!detailResponse.policy.petsAllowed,
            smokingAllowed: !!detailResponse.policy.smokingAllowed,
            cancellationPolicy: detailResponse.policy.cancellationPolicyEn || '',
            cancellationPolicyEn: detailResponse.policy.cancellationPolicyEn,
            cancellationPolicyAr: detailResponse.policy.cancellationPolicyAr,
            cancellationPolicyTr: detailResponse.policy.cancellationPolicyTr,
          } : undefined,
        };
        hotelDao.insertHotel(hotel);
        return localizeHotel(hotel);
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
