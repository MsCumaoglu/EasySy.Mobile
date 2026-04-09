import {atom} from 'jotai';
import {BusTrip} from '../models/BusTrip';
import {BusSearchParams} from '../types/busTypes';

export const busSearchParamsAtom = atom<BusSearchParams>({
  from: '',
  to: '',
  date: null,
  passengers: 1,
});

export const busResultsAtom = atom<BusTrip[]>([]);
