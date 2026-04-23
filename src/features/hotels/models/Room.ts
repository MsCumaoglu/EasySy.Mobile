/**
 * Room Model — Represents a hotel room from the API.
 *
 * The API returns rooms with a single localized `name` (driven by Accept-Language).
 * Localization is handled automatically by the backend.
 */

export type RoomType = 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'QUAD' | 'SUITE' | 'FAMILY' | 'STUDIO';
export type BedType = 'SINGLE_BED' | 'DOUBLE_BED' | 'QUEEN_BED' | 'KING_BED' | 'TWIN_BED' | 'BUNK_BED' | 'SOFA_BED';
export type ViewType = 'CITY_VIEW' | 'SEA_VIEW' | 'GARDEN_VIEW' | 'POOL_VIEW' | 'MOUNTAIN_VIEW' | 'NO_VIEW';

export interface RoomApiResponse {
  id: string;
  hotelId: string;
  name: string;
  roomType: RoomType;
  bedType: BedType;
  bedCount: number;
  maxAdults: number;
  maxChildren: number;
  roomSizeSqm: number;
  basePriceSyp: number;
  quantity: number;
  viewType: ViewType;
  hasPrivateBathroom: boolean;
  hasBalcony: boolean;
  hasAirConditioning: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** UI-ready room model with localized name */
export interface Room {
  id: string;
  hotelId: string;
  name: string;
  roomType: RoomType;
  bedType: BedType;
  bedCount: number;
  maxAdults: number;
  maxChildren: number;
  roomSizeSqm: number;
  basePriceSyp: number;
  quantity: number;
  viewType: ViewType;
  hasPrivateBathroom: boolean;
  hasBalcony: boolean;
  hasAirConditioning: boolean;
  isActive: boolean;
}
