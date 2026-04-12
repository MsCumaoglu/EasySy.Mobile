import apiClient from '../apiClient';

// --- Requests ---
export interface HotelSearchParams {
  cityId: string;
  checkIn: string; // YYYY-MM-DD format
  checkOut: string; // YYYY-MM-DD format
  adults: number;
  rooms: number;
}

// --- Responses ---
export interface HotelLocationResult {
  id: string; // ID for cityId parameter
  name: string; // e.g. "Hama"
  country: string; // e.g. "Syria"
  hotelCount: number; // e.g. 9
}

export interface PopularHotel {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  pricePerNight: number;
  rating: number; // 0-5
}

export interface HotelSearchResult {
  id: string;
  name: string;
  stars: number;
  location: string;
  imageUrl: string;
  pricePerNight: number;
  rating: number; // 0-5
  reviewCount: number;
  amenities: string[]; // ["Free WiFi", "Pool"]
}

export interface HotelDetailRoom {
  id: string;
  name: string;
  pricePerNight: number;
  capacity: number;
  bedType: string; // "1 King Bed"
  amenities: string[];
}

export interface HotelDetailResponse {
  id: string;
  name: string;
  stars: number;
  location: string;
  address: string;
  description: string;
  rating: number;
  reviewCount: number;
  images: string[];
  amenities: string[];
  rooms: HotelDetailRoom[];
}

export const hotelService = {
  /**
   * GET /hotel/locations?search={query}
   * Fetches cities/locations for the autocomplete search input.
   */
  searchLocations: async (query: string): Promise<HotelLocationResult[]> => {
    return apiClient.get('/hotel/locations', { params: { search: query } });
  },

  /**
   * GET /hotel/popular
   * Fetches a list of highly rated or sponsored hotels to show on the main search screen.
   */
  getPopularHotels: async (): Promise<PopularHotel[]> => {
    return apiClient.get('/hotel/popular');
  },

  /**
   * POST /hotel/search
   * Returns a list of available hotels matching the criteria.
   */
  searchHotels: async (params: HotelSearchParams): Promise<HotelSearchResult[]> => {
    return apiClient.post('/hotel/search', params);
  },
  
  /**
   * GET /hotel/{hotelId}
   * Returns detailed information about a hotel including its rooms.
   */
  getHotelDetails: async (hotelId: string): Promise<HotelDetailResponse> => {
    return apiClient.get(`/hotel/${hotelId}`);
  }
};
