import {HotelAmenity} from '../models/Hotel';

export interface HotelSearchParams {
  location: string;
  checkIn: string | null;
  checkOut: string | null;
  guests: number;
  children: number;
  rooms: number;
}

export interface HotelFilters {
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  amenities?: HotelAmenity[];
  category?: string;
}

export type HotelTab = 'detail' | 'overview' | 'reviews';
