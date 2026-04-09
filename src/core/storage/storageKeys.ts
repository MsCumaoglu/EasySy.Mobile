export const StorageKeys = {
  APP_THEME: 'app_theme',
  APP_LANGUAGE: 'app_language',
  RECENT_HOTEL_SEARCHES: 'recent_hotel_searches',
  RECENT_BUS_SEARCHES: 'recent_bus_searches',
  USER_BOOKINGS: 'user_bookings',
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];
