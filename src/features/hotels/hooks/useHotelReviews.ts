/**
 * useHotelReviews — Infinite Query Hook for hotel reviews
 *
 * Fetches reviews from /api/v1/hotels/{hotelId}/reviews using pagination.
 * Falls back to SQLite cache when offline.
 *
 * Usage:
 *   const { data, fetchNextPage, hasNextPage, isLoading } = useHotelReviews(hotelId);
 *   const reviews = data?.pages.flatMap(p => p.reviews) ?? [];
 */

import {useInfiniteQuery} from '@tanstack/react-query';
import {hotelRepository} from '../services/hotelRepository';

const REVIEWS_PAGE_SIZE = 20;

export function useHotelReviews(hotelId: string, enabled: boolean = true) {
  return useInfiniteQuery({
    queryKey: ['hotels', 'reviews', hotelId] as const,

    queryFn: ({pageParam}) =>
      hotelRepository.getHotelReviews(hotelId, pageParam as number, REVIEWS_PAGE_SIZE),

    initialPageParam: 0,

    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.isLast) { return undefined; }
      return allPages.length; // 0-indexed: next page = current count
    },

    enabled: !!hotelId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
