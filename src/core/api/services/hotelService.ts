import apiClient from '../apiClient';
import {ENDPOINTS} from '../endpoints';
import {RoomApiResponse} from '../../../features/hotels/models/Room';

// --- Requests ---
export interface HotelSearchParams {
  city?: string;    // optional — backend works without it
  checkIn: string;  // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  adults: number;
  rooms?: number;
}

// ---------------------------------------------------------------------------
// Real API response types (matching backend contract)
// ---------------------------------------------------------------------------

/** One hotel item returned inside `content[]` */
export interface HotelSearchResultItem {
  id: string;
  name: string;            // Localized name (Accept-Language driven)
  propertyType: string;    // 'HOTEL' | 'RESORT' | 'VILLA' | 'HOSTEL' | 'APARTMENT' | 'GUESTHOUSE'
  starRating: number;      // 1-5
  city: string;
  district: string;
  avgRating: number;       // 0-5
  totalReviews: number;
  primaryImageUrl: string;
  pricePerNight: number;   // in local currency (SYP)
  status: string;          // 'DRAFT' | 'ACTIVE' | ...
  amenities: string[];     // e.g. ['free_wifi', 'swimming_pool', 'restaurant']
}

/** Paginated wrapper returned by the search endpoint */
export interface HotelSearchPageResponse {
  content: HotelSearchResultItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// ---------------------------------------------------------------------------
// Detail endpoint response types (matching /api/v1/hotels/{id} contract)
// ---------------------------------------------------------------------------

/** Reusable translations map: { [lang]: { [field]: value } } */
export type TranslationsMap = Record<string, Record<string, string>>;

export interface HotelAmenityResponse {
  id: string;
  amenityKey: string;       // e.g. 'free_wifi', 'swimming_pool'
  category: string;         // 'GENERAL' | 'ROOM' | ...
  isFree: boolean;
}

export interface HotelImageResponse {
  id: string;
  url: string;
  category: string;         // 'EXTERIOR' | 'ROOM' | 'LOBBY' | ...
  caption: string;
  translations?: TranslationsMap;
  sortOrder: number;
  isPrimary: boolean;
}

export interface HotelPolicyResponse {
  id: string;
  checkInFrom?: string;
  checkInUntil?: string;
  checkOutUntil?: string;
  childrenAllowed?: boolean;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  cancellationPolicy?: string;   // Localized via Accept-Language
  translations?: TranslationsMap;
}

export interface HotelDetailResponse {
  id: string;
  ownerUserId?: string;
  name: string;                  // Localized via Accept-Language
  description: string;           // Localized via Accept-Language
  address: string;               // Localized via Accept-Language
  translations?: TranslationsMap;
  propertyType: string;
  starRating: number;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  phone?: string;
  whatsapp?: string;
  email?: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: string;
  isFeatured?: boolean;
  avgRating: number;
  totalReviews: number;
  amenities: HotelAmenityResponse[];
  images: HotelImageResponse[];
  policy?: HotelPolicyResponse;
  createdAt?: string;
  updatedAt?: string;
}

export const hotelService = {
  /**
   * GET /api/v1/hotels/search
   * Returns a paginated list of hotels matching the criteria.
   * Unwraps the `content` array from the paginated response.
   */
  searchHotels: async (params: HotelSearchParams): Promise<HotelSearchResultItem[]> => {
    // Clean empty string parameters to prevent 404/validation errors
    const cleanParams: any = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== '' && value !== undefined && value !== null) {
        cleanParams[key] = value;
      }
    }

    const response: HotelSearchPageResponse = await apiClient.get(
      ENDPOINTS.HOTELS.SEARCH,
      { params: cleanParams },
    );
    return response?.content ?? [];
  },

  /**
   * GET /api/v1/hotels/{hotelId}
   * Returns detailed information about a hotel including its rooms.
   */
  getHotelDetails: async (hotelId: string): Promise<HotelDetailResponse> => {
    return apiClient.get(ENDPOINTS.HOTELS.DETAIL(hotelId));
  },

  /**
   * GET /api/v1/hotels/search/locations
   * Returns a list of available cities and their hotel counts.
   */
  getLocations: async (): Promise<any[]> => {
    return apiClient.get(ENDPOINTS.HOTELS.LOCATIONS);
  },

  /**
   * GET /api/v1/hotels/{hotelId}/rooms
   * Returns the list of rooms for a specific hotel.
   */
  getRooms: async (hotelId: string): Promise<RoomApiResponse[]> => {
    return apiClient.get(ENDPOINTS.HOTELS.ROOMS(hotelId));
  },
};
