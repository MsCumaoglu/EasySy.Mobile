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
import {useTranslation} from 'react-i18next';

export function useHotelDetail(
  hotelId: string,
  /**
   * Optional initial data — pass the hotel from selectedHotelAtom so the
   * screen doesn't flash a loader when navigating from the results list.
   */
  initialData?: Hotel | null,
) {
  const { i18n } = useTranslation();

  return useQuery({
    queryKey: ['hotels', 'detail', hotelId, i18n.language] as const,
    queryFn: () => hotelRepository.getHotelById(hotelId),

    /**
     * staleTime: Detail pages are considered fresh for 1 hour.
     * Hotel details (description, amenities) change less frequently than prices.
     */
    staleTime: 60 * 60 * 1000, // 1 hour

    /**
     * initialData: Use the data already in memory (from Jotai atom) as a
     * placeholder. By setting initialDataUpdatedAt: 0, TanStack Query will
     * immediately re-fetch in the background to get the full details while
     * still showing the cached partial data instantly.
     */
    initialData: initialData ?? undefined,
    initialDataUpdatedAt: initialData ? 0 : undefined,

    enabled: !!hotelId,
  });
}
