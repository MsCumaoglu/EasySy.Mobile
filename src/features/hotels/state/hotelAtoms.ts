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

export const hotelResultsAtom = atom<Hotel[]>([]);

export const selectedHotelAtom = atom<Hotel | null>(null);
