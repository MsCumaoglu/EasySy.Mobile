import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { storageService } from '../core/storage/storage';

export type AppTheme = 'light' | 'dark' | 'system';
export type AppLanguage = 'en' | 'tr' | 'ar';
export type AppCurrency = 'USD' | 'EUR' | 'TRY';

// Create a SyncStorage wrapper around MMKV for Jotai
const mmkvJotaiStorage = {
  getItem: (key: string): any => {
    const value = storageService.getString(key);
    return value !== undefined ? JSON.parse(value) : null;
  },
  setItem: (key: string, value: any): void => {
    storageService.setString(key, JSON.stringify(value));
  },
  removeItem: (key: string): void => {
    storageService.remove(key);
  },
};

export const appThemeAtom = atomWithStorage<AppTheme>('appTheme', 'light', mmkvJotaiStorage);
export const appLanguageAtom = atomWithStorage<AppLanguage>('appLanguage', 'en', mmkvJotaiStorage);
export const appCurrencyAtom = atomWithStorage<AppCurrency>('appCurrency', 'USD', mmkvJotaiStorage);
