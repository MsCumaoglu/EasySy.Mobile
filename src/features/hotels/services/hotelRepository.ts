/**
 * Hotel Repository — API-First Orchestrator
 *
 * Strategy (simple, reliable):
 *   1. Try the API call directly.
 *   2. On success → upsert into SQLite → return data.
 *   3. On network error → fall back to SQLite cache.
 *
 * NO ping-to-Google check. We just try the API and handle failures.
 * This ensures sort/filter params always reach the backend when online.
 */

import {hotelDao, reviewDao, locationDao} from '../../../core/database/hotelDao';
import { Alert } from 'react-native';
import {
  hotelService,
  HotelSearchResultItem,
  HotelReviewApiItem,
} from '../../../core/api/services/hotelService';
import {Hotel, HotelAmenity, HotelReview} from '../models/Hotel';
import {
  HotelSearchParams,
  HotelFilters,
  HotelSortOption,
  SORT_OPTION_TO_API,
  CATEGORY_TO_PROPERTY_TYPE,
} from '../types/hotelTypes';

export const PAGE_SIZE = 5;

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
      if (mapped && !result.includes(mapped)) { result.push(mapped); }
    }
  }
  return result;
}

function mapCategory(propertyType: string, stars: number): Hotel['category'] {
  const type = (propertyType || '').toUpperCase();
  if (type === 'RESORT')                    { return 'resort'; }
  if (type === 'HOTEL' && stars >= 4)       { return 'luxury'; }
  if (type === 'HOTEL')                     { return 'business'; }
  return 'budget';
}

function mapApiHotel(item: HotelSearchResultItem): Hotel {
  return {
    id:          item.id,
    name:        item.name,
    location:    `${item.city}, ${item.district}`,
    address:     '', // Not provided in search
    district:    item.district,
    city:        item.city,
    country:     'Syria',
    rating:      item.avgRating,
    starRating:  item.starRating,
    reviewCount: item.totalReviews,
    priceMin:    item.minTotalPrice ?? 0,
    priceMax:    item.minTotalPrice ?? 0,
    currency:    'SYP',
    images:      item.primaryImageUrl ? [item.primaryImageUrl] : [],
    amenities:   mapAmenities(item.amenities ?? []),
    description: '',
    coordinates: {latitude: 0, longitude: 0},
    category:    mapCategory(item.propertyType, item.starRating),
  };
}

function mapApiReview(item: HotelReviewApiItem): HotelReview {
  const authorName = item.userId
    ? `${item.source ?? 'User'}-${item.userId.slice(0, 6)}`
    : 'Anonymous';
  const date = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString()
    : '';
  return {
    id:            item.id,
    hotelId:       item.hotelId,
    bookingId:     item.bookingId,
    userId:        item.userId,
    source:        item.source,
    overallRating: item.overallRating,
    content:       item.content,
    createdAt:     item.createdAt,
    authorName,
    rating:        item.overallRating,
    comment:       item.content,
    date,
  };
}

// ---------------------------------------------------------------------------
// Cache key helpers
// ---------------------------------------------------------------------------

function buildSearchKey(
  params: Partial<HotelSearchParams>,
  page: number,
  filters: HotelFilters,
  sortBy: HotelSortOption,
): string {
  return [
    'search',
    (params.location ?? '').toLowerCase().trim(),
    params.checkIn ?? '',
    params.checkOut ?? '',
    params.roomsConfig ? params.roomsConfig.map(r => `${r.adults}:${r.children}`).join(',') : '',
    'page',  page,
    'sort',  sortBy,
    'minp',  filters.minPrice ?? '',
    'maxp',  filters.maxPrice ?? '',
    'g_rat', filters.minGuestRating ?? '',
    's_rat', filters.minStarRating ?? '',
    'ptyp',  filters.propertyType ?? '',
    'feat',  filters.isFeatured ? '1' : '0',
    'room',  (filters.roomTypes ?? []).slice().sort().join(','),
    'view',  (filters.viewTypes ?? []).slice().sort().join(','),
    'amen',  (filters.amenities ?? []).slice().sort().join(','),
  ].join(':');
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const hotelRepository = {
  /**
   * Search hotels with pagination, optional filters and sort.
   *
   * Always tries the API first. On network failure → SQLite fallback.
   * Sort and filter params are always forwarded to the API when reachable.
   */
  async searchHotels(
    params: Partial<HotelSearchParams>,
    page: number,
    filters: HotelFilters = {},
    sortBy: HotelSortOption = 'recommended',
  ): Promise<{hotels: Hotel[]; totalPages: number; isLast: boolean}> {
    const cacheKey = buildSearchKey(params, page, filters, sortBy);

    // Resolve sort params
    const {sortBy: apiSortBy, sortDirection} = SORT_OPTION_TO_API[sortBy];

    // ── Try API first ──
    try {
      const response = await hotelService.searchHotels({
        // Location
        city:           params.location || undefined,
        // Dates
        checkIn:        params.checkIn  || undefined,
        checkOut:       params.checkOut || undefined,
        // Rooms formatted for backend (e.g. 2:0,1:1)
        rooms:          params.roomsConfig ? params.roomsConfig.map(r => `${r.adults}:${r.children}`).join(',') : undefined,
        // Pagination (backend is 0-indexed)
        page:           page - 1,
        size:           PAGE_SIZE,
        // Filters — exact backend param names from swagger
        minPrice:       filters.minPrice,
        maxPrice:       filters.maxPrice,
        minGuestRating: filters.minGuestRating,   // matched to swagger
        minStarRating:  filters.minStarRating,    // matched to swagger
        amenities:      filters.amenities,        // formatted by paramsSerializer
        propertyType:   filters.propertyType,     // correctly mapped propertyType
        roomTypes:      filters.roomTypes,        // new from swagger
        viewTypes:      filters.viewTypes,        // new from swagger
        isFeatured:     filters.isFeatured,       // new from swagger
        // Sort — two separate fields (sortBy field + sortDirection)
        sortBy:         apiSortBy,
        sortDirection,
      });

      const hotels = (response.content ?? []).map(mapApiHotel);

      // Upsert into SQLite for offline fallback
      if (hotels.length > 0) {
        try { hotelDao.insertSearchResult(cacheKey, hotels); } catch (e) {
          console.warn('[DB] Failed to cache search results:', e);
        }
      }

      return {
        hotels,
        totalPages: response.totalPages ?? 1,
        isLast:     response.last ?? true,
      };
    } catch (apiError: any) {
      // ── API unreachable → SQLite fallback ──
      console.warn('[hotelRepository] API failed, serving from SQLite cache:', apiError);
      Alert.alert('API Error', `Could not fetch hotels from server: ${apiError?.message || 'Unknown Error'}`);
      
      try {
        const cached = hotelDao.getBySearchKey(cacheKey);
        if (cached && cached.length > 0) {
          return {hotels: cached, totalPages: 1, isLast: true};
        }
      } catch (dbError) {
        console.warn('[DB] Failed to read from cache:', dbError);
      }
      
      // If we reach here, API failed AND cache is empty. 
      // Throw the error so React Query doesn't cache an empty array!
      throw apiError;
    }
  },

  /**
   * Fetch a single hotel by ID.
   * API first → cache. On failure → SQLite.
   */
  async getHotelById(id: string): Promise<Hotel | null> {
    try {
      const d = await hotelService.getHotelDetails(id);
      if (d) {
        const sortedImages = [...(d.images || [])].sort((a, b) => a.sortOrder - b.sortOrder);
        const imageUrls = sortedImages.map(img => img.url).filter(Boolean);
        const primaryImg = sortedImages.find(img => img.isPrimary);
        const location = d.district
          ? `${d.city}, ${d.district}`
          : d.address || d.city || 'Unknown';

        // Preserve prices if they exist in cache (from a search)
        const cached = hotelDao.getById(id);
        
        const hotel: Hotel = {
          id:          d.id || id,
          name:        d.name || 'Unknown Hotel',
          location,
          address:     d.address || '',
          district:    d.district || '',
          city:        d.city || 'Unknown',
          country:     'Syria',
          rating:      d.avgRating ?? 0,
          starRating:  d.starRating ?? 3,
          reviewCount: d.totalReviews ?? 0,
          priceMin:    (cached?.priceMin && cached.priceMin > 0) ? cached.priceMin : 0,
          priceMax:    (cached?.priceMax && cached.priceMax > 0) ? cached.priceMax : 0,
          currency:    cached?.currency || 'SYP',
          images:      imageUrls.length > 0
            ? imageUrls
            : (primaryImg ? [primaryImg.url] : []),
          amenities:   mapAmenities(d.amenities || []),
          isAvailableForBooking: d.isAvailableForBooking,
          phone:       d.phone,
          whatsapp:    d.whatsapp,
          description: d.description || '',
          coordinates: {latitude: d.latitude || 0, longitude: d.longitude || 0},
          category:    mapCategory(d.propertyType || 'HOTEL', d.starRating || 3),
          policy:      d.policy ? {
            checkInFrom:        d.policy.checkInFrom  || d.checkInTime  || '14:00',
            checkInUntil:       d.policy.checkInUntil || '00:00',
            checkOutUntil:      d.policy.checkOutUntil || d.checkOutTime || '12:00',
            childrenAllowed:    !!d.policy.childrenAllowed,
            petsAllowed:        !!d.policy.petsAllowed,
            smokingAllowed:     !!d.policy.smokingAllowed,
            cancellationPolicy: d.policy.cancellationPolicy || '',
          } : undefined,
        };

        try { hotelDao.insertHotel(hotel); } catch (e) {
          console.warn('[DB] Failed to upsert hotel detail:', e);
        }

        return hotel;
      }
    } catch (e) {
      console.error('[API] Failed to fetch hotel details, falling back to SQLite:', e);
    }

    // Fallback → SQLite
    try {
      return hotelDao.getById(id) ?? null;
    } catch {
      return null;
    }
  },

  /**
   * Fetch reviews for a hotel (paginated).
   * API first → cache page 0. On failure → SQLite.
   */
  async getHotelReviews(
    hotelId: string,
    page: number = 0,
    size: number = PAGE_SIZE,
  ): Promise<{reviews: HotelReview[]; isLast: boolean; totalPages: number}> {
    try {
      const response = await hotelService.getHotelReviews(hotelId, page, size);
      const reviews = (response.content ?? []).map(mapApiReview);

      // Cache first page as offline fallback
      if (page === 0 && reviews.length > 0) {
        try { reviewDao.insert(hotelId, reviews); } catch (e) {
          console.warn('[DB] Failed to cache reviews:', e);
        }
      }

      return {
        reviews,
        isLast:     response.last ?? true,
        totalPages: response.totalPages ?? 1,
      };
    } catch (e) {
      console.error('[API] Failed to fetch reviews, falling back to SQLite:', e);
      const cached = (() => { try { return reviewDao.get(hotelId); } catch { return null; } })();
      return {reviews: cached ?? [], isLast: true, totalPages: 1};
    }
  },

  /**
   * Fetch popular hotels.
   */
  async getPopularHotels(): Promise<Hotel[]> {
    try {
      const response = await hotelService.searchHotels({page: 0, size: 10});
      const hotels = (response.content ?? []).map(mapApiHotel);
      if (hotels.length > 0) {
        try { hotelDao.insertSearchResult('popular:page:1', hotels); } catch {}
      }
      return hotels;
    } catch (e) {
      console.error('[API] Failed to fetch popular hotels:', e);
      try {
        return hotelDao.getBySearchKey('popular:page:1') ?? [];
      } catch {
        return [];
      }
    }
  },

  /**
   * Force-invalidates all search caches.
   */
  invalidateSearchCache(): void {
    try { hotelDao.invalidateSearches(); } catch {}
  },

  /**
   * Fetch available locations (cities) and their hotel counts.
   */
  async fetchLocations(): Promise<any[]> {
    try {
      const locations = await hotelService.getLocations();
      if (locations && locations.length > 0) {
        try { locationDao.insertLocations(locations); } catch {}
      }
      return locations ?? [];
    } catch (e) {
      console.error('[API] Failed to fetch locations:', e);
      try {
        return locationDao.getLocations() ?? [];
      } catch {
        return [];
      }
    }
  },
};
