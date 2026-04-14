/**
 * useHotelSearch — Infinite Query Hook
 *
 * Provides paginated hotel search results with automatic caching.
 * Uses TanStack Query's useInfiniteQuery to manage:
 *   - Loading / error states
 *   - Page tracking and merging
 *   - Automatic deduplication (same params = same cache entry)
 *
 * Usage:
 *   const { data, fetchNextPage, hasNextPage, isLoading } = useHotelSearch(params);
 *   const hotels = data?.pages.flat() ?? [];
 */

import {useInfiniteQuery} from '@tanstack/react-query';
import {hotelRepository, PAGE_SIZE} from '../services/hotelRepository';
import {HotelSearchParams} from '../types/hotelTypes';
import {useTranslation} from 'react-i18next';

export function useHotelSearch(params: Partial<HotelSearchParams>) {
  const { i18n } = useTranslation();

  return useInfiniteQuery({
    /**
     * queryKey — TanStack Query uses this to deduplicate and cache.
     * If params don't change, the cached result is returned instantly.
     */
    queryKey: ['hotels', 'search', params, i18n.language] as const,

    /**
     * queryFn — Called when data is needed.
     * pageParam starts at 1 and increments on each fetchNextPage() call.
     */
    queryFn: ({pageParam}) =>
      hotelRepository.searchHotels(params, pageParam as number),

    /**
     * initialPageParam — The first page to load.
     */
    initialPageParam: 1,

    /**
     * getNextPageParam — Determines whether there is a next page.
     * If the last page returned fewer items than PAGE_SIZE, we've reached the end.
     */
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) {
        return undefined; // No more pages
      }
      return allPages.length + 1;
    },

    /**
     * enabled — Ensure we don't block queries without dates,
     * so location-only searches can also work.
     */
    enabled: true,
  });
}
