import {atom} from 'jotai';
import {storageService} from '../storage/storage';

export type User = {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
};

// Onboarding persistence
const HAS_ONBOARDED_KEY = 'has_completed_onboarding';
const initialOnboarding = storageService.getBoolean(HAS_ONBOARDED_KEY) ?? false;
const baseOnboardingAtom = atom(initialOnboarding);

export const hasCompletedOnboardingAtom = atom(
  (get) => get(baseOnboardingAtom),
  (_get, set, newValue: boolean) => {
    set(baseOnboardingAtom, newValue);
    storageService.setBoolean(HAS_ONBOARDED_KEY, newValue);
  }
);

// Guest mode persistence
const IS_GUEST_KEY = 'is_guest_mode';
const initialGuest = storageService.getBoolean(IS_GUEST_KEY) ?? false;
const baseGuestAtom = atom(initialGuest);

export const isGuestAtom = atom(
  (get) => get(baseGuestAtom),
  (_get, set, newValue: boolean) => {
    set(baseGuestAtom, newValue);
    storageService.setBoolean(IS_GUEST_KEY, newValue);
  }
);

// Authenticated user state (will be populated by Firebase)
export const userAtom = atom<User | null>(null);
