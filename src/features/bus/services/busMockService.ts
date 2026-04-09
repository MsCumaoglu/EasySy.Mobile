import {BusTrip} from '../models/BusTrip';
import {BusSearchParams} from '../types/busTypes';

const MOCK_TRIPS: BusTrip[] = [
  {
    id: 'b1',
    company: 'Kadmous Express',
    from: 'Damascus',
    to: 'Lattakia',
    departureTime: '08:00',
    arrivalTime: '11:15',
    durationMinutes: 195,
    price: 9.0,
    currency: 'USD',
    availableSeats: 14,
    busType: 'express',
    amenities: ['ac', 'wifi', 'usb'],
  },
  {
    id: 'b2',
    company: 'Kadmous Express',
    from: 'Damascus',
    to: 'Lattakia',
    departureTime: '12:30',
    arrivalTime: '15:50',
    durationMinutes: 200,
    price: 9.0,
    currency: 'USD',
    availableSeats: 22,
    busType: 'standard',
    amenities: ['ac'],
  },
  {
    id: 'b3',
    company: 'Al-Ahly Transport',
    from: 'Damascus',
    to: 'Lattakia',
    departureTime: '09:00',
    arrivalTime: '12:30',
    durationMinutes: 210,
    price: 12.5,
    currency: 'USD',
    availableSeats: 8,
    busType: 'vip',
    amenities: ['ac', 'wifi', 'usb', 'snacks'],
  },
  {
    id: 'b4',
    company: 'Al-Ahly Transport',
    from: 'Damascus',
    to: 'Tartus',
    departureTime: '07:30',
    arrivalTime: '10:15',
    durationMinutes: 165,
    price: 8.0,
    currency: 'USD',
    availableSeats: 18,
    busType: 'standard',
    amenities: ['ac'],
  },
  {
    id: 'b5',
    company: 'Syrian Lines',
    from: 'Aleppo',
    to: 'Damascus',
    departureTime: '06:00',
    arrivalTime: '09:30',
    durationMinutes: 210,
    price: 14.0,
    currency: 'USD',
    availableSeats: 5,
    busType: 'vip',
    amenities: ['ac', 'wifi', 'usb', 'snacks', 'toilet'],
  },
  {
    id: 'b6',
    company: 'Kadmous Express',
    from: 'Lattakia',
    to: 'Damascus',
    departureTime: '15:00',
    arrivalTime: '18:10',
    durationMinutes: 190,
    price: 9.5,
    currency: 'USD',
    availableSeats: 31,
    busType: 'express',
    amenities: ['ac', 'usb'],
  },
];

export const busMockService = {
  searchTrips: async (params: Partial<BusSearchParams>): Promise<BusTrip[]> => {
    await new Promise<void>(resolve => setTimeout(resolve, 700));
    return MOCK_TRIPS.filter(trip => {
      const fromMatch = !params.from ||
        trip.from.toLowerCase().includes(params.from.toLowerCase());
      const toMatch = !params.to ||
        trip.to.toLowerCase().includes(params.to.toLowerCase());
      return fromMatch && toMatch;
    });
  },

  getAllTrips: async (): Promise<BusTrip[]> => {
    await new Promise<void>(resolve => setTimeout(resolve, 500));
    return MOCK_TRIPS;
  },

  getTripById: async (id: string): Promise<BusTrip | null> => {
    await new Promise<void>(resolve => setTimeout(resolve, 300));
    return MOCK_TRIPS.find(t => t.id === id) ?? null;
  },
};
