export interface Hotel {
  id: string;
  name: string;
  location: string;
  city: string;
  country: string;
  rating: number;
  reviewCount: number;
  priceMin: number;
  priceMax: number;
  currency: string;
  images: string[];
  amenities: HotelAmenity[];
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  category: 'luxury' | 'business' | 'budget' | 'resort';
}

export type HotelAmenity =
  | 'pool'
  | 'wifi'
  | 'restaurant'
  | 'parking'
  | 'spa'
  | 'gym'
  | 'ac'
  | 'breakfast';

export interface HotelReview {
  id: string;
  hotelId: string;
  authorName: string;
  rating: number;
  comment: string;
  date: string;
}
