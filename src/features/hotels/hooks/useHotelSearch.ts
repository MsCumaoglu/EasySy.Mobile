/**
 * useHotelSearch — Infinite Query Hook
 *
 * Provides API-driven paginated hotel search results.
 * Passes filters and sort options directly to the API — no client-side processing.
 *
 * Changing `filters` or `sortBy` triggers a new query (TanStack de-duplication
 * ensures no redundant requests for the same combination).
 *
 * Usage:
 *   const { data, fetchNextPage, hasNextPage, isLoading } = useHotelSearch(params, filters, sortBy);
 *   const hotels = data?.pages.flatMap(p => p.hotels) ?? [];
 */

import {useInfiniteQuery} from '@tanstack/react-query';
import {hotelRepository, PAGE_SIZE} from '../services/hotelRepository';
import {HotelSearchParams, HotelFilters, HotelSortOption} from '../types/hotelTypes';

export function useHotelSearch(
  params: Partial<HotelSearchParams>,
  filters: HotelFilters = {},
  sortBy: HotelSortOption = 'recommended',
) {
  return useInfiniteQuery({
    /**
     * queryKey — TanStack uses this to deduplicate and cache.
     * Any change to params, filters, or sortBy triggers a fresh fetch.
     */
    queryKey: ['hotels', 'search', params, filters, sortBy] as const,

    /**
     * queryFn — Delegates entirely to the repository, which decides
     * whether to hit the API or fall back to SQLite.
     */
    queryFn: ({pageParam}) =>
      hotelRepository.searchHotels(
        params,
        pageParam as number,
        filters,
        sortBy,
      ),

    initialPageParam: 1,

    /**
     * getNextPageParam — Uses the backend's `isLast` flag to determine
     * whether there are more pages. This replaces the old length-based check
     * which caused results to stop at PAGE_SIZE items.
     */
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.isLast) {
        return undefined; // No more pages
      }
      return allPages.length + 1;
    },

    enabled: true,
  });
}

export {PAGE_SIZE};
