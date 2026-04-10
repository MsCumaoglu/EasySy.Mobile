import {Hotel, HotelReview} from '../models/Hotel';
import {HotelSearchParams} from '../types/hotelTypes';

const MOCK_HOTELS: Hotel[] = [
  {
    id: '1',
    name: 'Palmyra Hotel',
    location: 'Tartus, Syria',
    city: 'Tartus',
    country: 'Syria',
    rating: 4.8,
    reviewCount: 234,
    priceMin: 500,
    priceMax: 800,
    currency: 'USD',
    images: [
      'https://picsum.photos/seed/palmyra1/800/500',
      'https://picsum.photos/seed/palmyra2/800/500',
      'https://picsum.photos/seed/palmyra3/800/500',
      'https://picsum.photos/seed/palmyra3/800/500',
      'https://picsum.photos/seed/lattakia2/800/500',
    ],
    amenities: ['pool', 'wifi', 'restaurant', 'spa', 'gym', 'breakfast', 'ac'],
    description:
      'Nestled along the Mediterranean coast, Palmyra Hotel offers a luxurious escape with panoramic sea views, world-class dining, and exceptional service. Each room is elegantly appointed with modern amenities.',
    coordinates: {latitude: 34.8889, longitude: 35.8864},
    category: 'luxury',
  },
  {
    id: '2',
    name: 'Lattakia Grand Hotel',
    location: 'Lattakia, Syria',
    city: 'Lattakia',
    country: 'Syria',
    rating: 4.5,
    reviewCount: 189,
    priceMin: 350,
    priceMax: 620,
    currency: 'USD',
    images: [
      'https://picsum.photos/seed/lattakia1/800/500',
      'https://picsum.photos/seed/lattakia2/800/500',
    ],
    amenities: ['pool', 'wifi', 'restaurant', 'parking', 'ac', 'breakfast'],
    description:
      'A prestigious landmark in the heart of Lattakia city, offering sophisticated accommodations with stunning views of the harbor and easy access to local attractions.',
    coordinates: {latitude: 35.5317, longitude: 35.7912},
    category: 'business',
  },
  {
    id: '3',
    name: 'Blue Sea Resort',
    location: 'Jableh, Syria',
    city: 'Jableh',
    country: 'Syria',
    rating: 4.3,
    reviewCount: 145,
    priceMin: 280,
    priceMax: 450,
    currency: 'USD',
    images: [
      'https://picsum.photos/seed/bluesea1/800/500',
      'https://picsum.photos/seed/bluesea2/800/500',
    ],
    amenities: ['pool', 'wifi', 'restaurant', 'parking', 'ac'],
    description:
      'A beautiful beachfront resort offering direct access to crystal-clear Mediterranean waters. Perfect for families and couples seeking a relaxing coastal getaway.',
    coordinates: {latitude: 35.3616, longitude: 35.9151},
    category: 'resort',
  },
  {
    id: '4',
    name: 'Damascus Palace Hotel',
    location: 'Damascus, Syria',
    city: 'Damascus',
    country: 'Syria',
    rating: 4.6,
    reviewCount: 312,
    priceMin: 420,
    priceMax: 750,
    currency: 'USD',
    images: [
      'https://picsum.photos/seed/damascus1/800/500',
      'https://picsum.photos/seed/damascus2/800/500',
      'https://picsum.photos/seed/damascus2/800/500',
      'https://picsum.photos/seed/damascus2/800/500',  
      'https://picsum.photos/seed/damascus2/800/500',

    ],
    amenities: ['wifi', 'restaurant', 'gym', 'spa', 'parking', 'ac', 'breakfast'],
    description:
      'In the ancient heart of Damascus, this magnificent palace hotel blends traditional Syrian architecture with modern luxury. Guests enjoy exquisite cuisine and cultural immersion.',
    coordinates: {latitude: 33.5102, longitude: 36.2913},
    category: 'luxury',
  },
  {
    id: '5',
    name: 'Aleppo Heritage Inn',
    location: 'Aleppo, Syria',
    city: 'Aleppo',
    country: 'Syria',
    rating: 4.2,
    reviewCount: 98,
    priceMin: 200,
    priceMax: 380,
    currency: 'USD',
    images: [
      'https://picsum.photos/seed/aleppo1/800/500',
      'https://picsum.photos/seed/aleppo2/800/500',
    ],
    amenities: ['wifi', 'breakfast', 'ac', 'parking'],
    description:
      'A charming boutique hotel set within a restored Ottoman-era mansion. Experience the rich history and culture of Aleppo while enjoying warm, personalized hospitality.',
    coordinates: {latitude: 36.2021, longitude: 37.1343},
    category: 'budget',
  },
];

const MOCK_REVIEWS: HotelReview[] = [
  {
    id: 'r1',
    hotelId: '1',
    authorName: 'Sarah M.',
    rating: 5,
    comment:
      'Absolutely stunning hotel! The pool area is breathtaking and the staff were incredibly helpful.',
    date: '2026-03-15',
  },
  {
    id: 'r2',
    hotelId: '1',
    authorName: 'Ahmed K.',
    rating: 4.8,
    comment:
      'Fantastic experience, the breakfast buffet was extraordinary. Will definitely return.',
    date: '2026-02-28',
  },
  {
    id: 'r3',
    hotelId: '2',
    authorName: 'Maria L.',
    rating: 4.5,
    comment:
      'Great location, clean rooms, and friendly staff. Perfect for a business trip.',
    date: '2026-03-10',
  },
];

export const hotelMockService = {
  searchHotels: async (params: Partial<HotelSearchParams>): Promise<Hotel[]> => {
    await new Promise(resolve => setTimeout(() => resolve(null), 800));
    const location = params.location;
    if (!location) {
      return MOCK_HOTELS;
    }
    const lowerLocation = location.toLowerCase();
    return MOCK_HOTELS.filter(
      h =>
        h.city.toLowerCase().includes(lowerLocation) ||
        h.location.toLowerCase().includes(lowerLocation),
    );
  },

  getHotelById: async (id: string): Promise<Hotel | null> => {
    await new Promise(resolve => setTimeout(() => resolve(null), 400));
    return MOCK_HOTELS.find(h => h.id === id) ?? null;
  },

  getAllHotels: async (): Promise<Hotel[]> => {
    await new Promise(resolve => setTimeout(() => resolve(null), 600));
    return MOCK_HOTELS;
  },

  getHotelReviews: async (hotelId: string): Promise<HotelReview[]> => {
    await new Promise(resolve => setTimeout(() => resolve(null), 400));
    return MOCK_REVIEWS.filter(r => r.hotelId === hotelId);
  },

  getPopularHotels: async (): Promise<Hotel[]> => {
    await new Promise(resolve => setTimeout(() => resolve(null), 500));
    return [...MOCK_HOTELS].sort((a, b) => b.rating - a.rating).slice(0, 3);
  },

  getRecentSearches: (): string[] => {
    return ['Tartus', 'Lattakia', 'Damascus'];
  },
};
