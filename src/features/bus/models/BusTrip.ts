export interface BusTrip {
  id: string;
  company: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  price: number;
  currency: string;
  availableSeats: number;
  busType: 'standard' | 'vip' | 'express';
  amenities: BusTripAmenity[];
}

export type BusTripAmenity = 'ac' | 'wifi' | 'usb' | 'snacks' | 'toilet';
