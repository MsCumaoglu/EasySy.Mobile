import {HotelAmenity} from '../models/Hotel';

export interface HotelRoomConfig {
  adults: number;
  children: number;
}

export interface HotelSearchParams {
  location: string;
  checkIn: string | null;
  checkOut: string | null;
  roomsConfig: HotelRoomConfig[];
}

export interface HotelFilters {
  minPrice?: number;
  maxPrice?: number;
  minGuestRating?: number; // matched to swagger
  minStarRating?: number;  // matched to swagger
  propertyType?: string;   // matched to swagger (replaces category)
  roomTypes?: string[];    // from swagger
  viewTypes?: string[];    // from swagger
  amenities?: string[];
  isFeatured?: boolean;    // from swagger
}

/**
 * Sort option keys — shared between the sort modal and the search hook.
 * Backend uses two separate params: sortBy (field) + sortDirection (asc|desc).
 */
export type HotelSortOption =
  | 'recommended'
  | 'price_asc'
  | 'price_desc'
  | 'rating_desc'
  | 'name_asc';

export interface ApiSortParams {
  sortBy?: string;
  sortDirection?: string;
}

/** Maps app sort option → backend { sortBy, sortDirection } params */
export const SORT_OPTION_TO_API: Record<HotelSortOption, ApiSortParams> = {
  recommended: {},
  price_asc:   {sortBy: 'pricePerNight', sortDirection: 'asc'},
  price_desc:  {sortBy: 'pricePerNight', sortDirection: 'desc'},
  rating_desc: {sortBy: 'avgRating',     sortDirection: 'desc'},
  name_asc:    {sortBy: 'name',          sortDirection: 'asc'},
};

/**
 * Maps the app's internal category filter → backend propertyType enum.
 * Backend values: HOTEL | APARTMENT | GUESTHOUSE | HOSTEL | VILLA | RESORT
 */
export const CATEGORY_TO_PROPERTY_TYPE: Record<string, string> = {
  luxury:   'HOTEL',
  business: 'HOTEL',
  resort:   'RESORT',
  budget:   'HOSTEL',
};

export type HotelTab = 'detail' | 'overview' | 'reviews';
