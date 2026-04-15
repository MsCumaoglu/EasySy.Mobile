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
import {hotelService} from '../../../core/api/services/hotelService';
import {Room, RoomApiResponse} from '../models/Room';

function mapApiRoom(item: RoomApiResponse, lang: string): Room {
  const isAr = lang === 'ar';
  return {
    id: item.id,
    hotelId: item.hotelId,
    name: isAr ? (item.nameAr || item.nameEn) : (item.nameEn || item.nameAr),
    nameAr: item.nameAr,
    nameEn: item.nameEn,
    roomType: item.roomType,
    bedType: item.bedType,
    bedCount: item.bedCount,
    maxAdults: item.maxAdults,
    maxChildren: item.maxChildren,
    roomSizeSqm: item.roomSizeSqm,
    basePriceSyp: item.basePriceSyp,
    quantity: item.quantity,
    viewType: item.viewType,
    hasPrivateBathroom: item.hasPrivateBathroom,
    hasBalcony: item.hasBalcony,
    hasAirConditioning: item.hasAirConditioning,
    isActive: item.isActive,
  };
}

export function useHotelRooms(hotelId: string) {
  const {i18n} = useTranslation();

  return useQuery<Room[]>({
    queryKey: ['hotels', 'rooms', hotelId, i18n.language] as const,
    queryFn: async () => {
      const raw = await hotelService.getRooms(hotelId);
      return raw.map(item => mapApiRoom(item, i18n.language));
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!hotelId,
  });
}
