/**
 * useHotelRooms — Fetches rooms for a specific hotel.
 *
 * Calls the API directly (no SQLite cache layer for rooms).
 * Localizes room names based on current i18n language.
 *
 * Usage:
 *   const { data: rooms, isLoading, isError } = useHotelRooms(hotelId);
 */

import {useQuery} from '@tanstack/react-query';
import {useTranslation} from 'react-i18next';
import {useAtomValue} from 'jotai';
import {hotelService, RoomCombinationItem} from '../../../core/api/services/hotelService';
import {hotelSearchParamsAtom} from '../state/hotelAtoms';

export function useHotelRoomCombinations(hotelId: string) {
  const {i18n} = useTranslation();
  const searchParams = useAtomValue(hotelSearchParamsAtom);

  // Format roomsConfig into "Adults:Children,Adults:Children"
  const roomsQueryString = searchParams.roomsConfig
    .map(r => `${r.adults}:${r.children}`)
    .join(',');

  return useQuery<RoomCombinationItem[]>({
    queryKey: ['hotels', 'combinations', hotelId, roomsQueryString, searchParams.checkIn, searchParams.checkOut, i18n.language] as const,
    queryFn: async () => {
      const response = await hotelService.getRoomCombinations(hotelId, {
        rooms: roomsQueryString,
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
      });
      return response.combinations || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!hotelId && !!roomsQueryString,
  });
}
