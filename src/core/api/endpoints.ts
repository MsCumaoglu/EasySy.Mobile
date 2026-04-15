export const ENDPOINTS = {
  HOTELS: {
    SEARCH: '/api/v1/hotels/search',
    LOCATIONS: '/api/v1/hotels/search/locations',
    DETAIL: (id: string) => `/api/v1/hotels/${id}`,
    ROOMS: (hotelId: string) => `/api/v1/hotels/${hotelId}/rooms`,
  },
  BUS: {
    SEARCH: '/api/v1/bus/search',
    DETAIL: (id: string) => `/api/v1/bus/${id}`,
  },
} as const;
