export interface Hotel {
  id: string;
  name: string;
  nameEn?: string;
  nameAr?: string;
  nameTr?: string;
  location: string;
  addressEn?: string;
  addressAr?: string;
  addressTr?: string;
  city: string;
  cityEn?: string;
  cityAr?: string;
  cityTr?: string;
  country: string;
  rating: number;
  reviewCount: number;
  priceMin: number;
  priceMax: number;
  currency: string;
  images: string[];
  amenities: HotelAmenity[];
  description: string;
  descriptionEn?: string;
  descriptionAr?: string;
  descriptionTr?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  category: 'luxury' | 'business' | 'budget' | 'resort';
  policy?: {
    checkInFrom: string;
    checkInUntil: string;
    checkOutUntil: string;
    childrenAllowed: boolean;
    petsAllowed: boolean;
    smokingAllowed: boolean;
    cancellationPolicy: string;
    cancellationPolicyEn?: string;
    cancellationPolicyAr?: string;
    cancellationPolicyTr?: string;
  };
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
