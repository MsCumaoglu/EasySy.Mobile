export const ENDPOINTS = {
  HOTELS: {
    SEARCH: '/hotels/search',
    DETAIL: (id: string) => `/hotels/${id}`,
  },
  BUS: {
    SEARCH: '/bus/search',
    DETAIL: (id: string) => `/bus/${id}`,
  },
} as const;
