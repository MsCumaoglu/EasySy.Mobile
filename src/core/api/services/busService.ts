import apiClient from '../apiClient';

// --- Requests ---
export interface BusSearchParams {
  originCityId: string;
  destinationCityId: string;
  departureDate: string; // YYYY-MM-DD
  passengers: number;
}

// --- Responses ---
export interface BusLocationResult {
  id: string; // Serves as originCityId or destinationCityId
  name: string; // "Damascus"
  country: string;
  stationName: string; // "Al-Qaboun Station"
}

export interface PopularBusRoute {
  id: string;
  origin: string;
  destination: string;
  priceStart: number;
  imageUrl: string; // Thumbnail of the destination
}

export interface BusSearchResult {
  id: string; // tripId
  companyName: string;
  companyLogoUrl: string; // URL to logo
  departureTime: string; // "10:00"
  arrivalTime: string; // "14:30"
  durationMinutes: number; // 270
  price: number;
  busType: string; // "2+1 VIP"
  availableSeats: number;
}

export interface SeatInfo {
  seatNumber: string;
  isAvailable: boolean;
  price: number;
  isWindow: boolean;
  genderRestriction?: 'male' | 'female' | null; // Sometime buses restrict neighboring seat genders
}

export interface BusSeatLayoutResponse {
  tripId: string;
  busType: string; // e.g. "2+1"
  totalRows: number;
  seats: SeatInfo[];
}

export const busService = {
  /**
   * GET /bus/locations?search={query}
   * Fetches bus stations or cities for autocomplete.
   */
  searchLocations: async (query: string): Promise<BusLocationResult[]> => {
    return apiClient.get('/bus/locations', { params: { search: query } });
  },

  /**
   * GET /bus/popular-routes
   * Fetches common routes to display as suggestions on the main screen.
   */
  getPopularRoutes: async (): Promise<PopularBusRoute[]> => {
    return apiClient.get('/bus/popular-routes');
  },

  /**
   * POST /bus/search
   */
  searchBusTickets: async (params: BusSearchParams): Promise<BusSearchResult[]> => {
    return apiClient.post('/bus/search', params);
  },
  
  /**
   * GET /bus/seats?tripId={tripId}
   */
  getBusSeatLayout: async (tripId: string): Promise<BusSeatLayoutResponse> => {
    return apiClient.get(`/bus/seats`, { params: { tripId } });
  }
};
