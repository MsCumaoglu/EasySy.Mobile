/**
 * useHotelDetail — Single Hotel Query Hook
 *
 * Fetches a hotel's full details.
 * Flow: SQLite cache → API (if stale/missing)
 *
 * The `initialData` trick: if the hotel is already in Jotai's selectedHotelAtom
 * (because the user tapped a card), we pass it as initialData so the detail
 * screen renders immediately without any loading spinner.
 *
 * Usage:
 *   const { data: hotel, isLoading, isError } = useHotelDetail(id, selectedHotel);
 */

import {useQuery} from '@tanstack/react-query';
import {hotelRepository} from '../services/hotelRepository';
import {Hotel} from '../models/Hotel';

export function useHotelDetail(
  hotelId: string,
  /**
   * Optional initial data — pass the hotel from selectedHotelAtom so the
   * screen doesn't flash a loader when navigating from the results list.
   */
  initialData?: Hotel | null,
) {
  return useQuery({
    queryKey: ['hotels', 'detail', hotelId] as const,
    queryFn: () => hotelRepository.getHotelById(hotelId),

    /**
     * staleTime: Detail pages are considered fresh for 1 hour.
     * Hotel details (description, amenities) change less frequently than prices.
     */
    staleTime: 60 * 60 * 1000, // 1 hour

    /**
     * initialData: Use the data already in memory (from Jotai atom) as a
     * placeholder. TanStack Query will still re-fetch in the background to
     * get the latest data, but the user sees content immediately.
     */
    initialData: initialData ?? undefined,

    enabled: !!hotelId,
  });
}
