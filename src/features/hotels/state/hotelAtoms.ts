import {atom} from 'jotai';
import {Hotel} from '../models/Hotel';
import {HotelSearchParams} from '../types/hotelTypes';

export const hotelSearchParamsAtom = atom<HotelSearchParams>({
  location: '',
  checkIn: null,
  checkOut: null,
  guests: 2,
  children: 0,
  rooms: 1,
});

// hotelResultsAtom removed — pagination is now managed by TanStack Query (useHotelSearch).

export const selectedHotelAtom = atom<Hotel | null>(null);
