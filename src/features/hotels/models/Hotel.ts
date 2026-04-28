export interface Hotel {
  id: string;
  name: string;
  nameEn?: string;
  nameAr?: string;
  nameTr?: string;
  location: string;
  address?: string;
  district?: string;
  addressEn?: string;
  addressAr?: string;
  addressTr?: string;
  city: string;
  cityEn?: string;
  cityAr?: string;
  cityTr?: string;
  country: string;
  rating: number;
  starRating: number;
  reviewCount: number;
  priceMin: number;
  priceMax: number;
  currency: string;
  images: string[];
  amenities: HotelAmenity[];
  isAvailableForBooking?: boolean;
  phone?: string;
  whatsapp?: string;
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
  // Core API fields
  id: string;
  hotelId: string;
  bookingId?: string;
  userId?: string;
  source?: string;        // 'EASYSY' | ...
  overallRating: number;  // 0-5
  content: string;        // Review text
  createdAt: string;      // ISO 8601

  // Computed / display helpers (populated during mapping)
  authorName: string;     // Derived from userId or 'Anonymous'
  rating: number;         // Alias for overallRating
  comment: string;        // Alias for content
  date: string;           // Formatted createdAt
}

