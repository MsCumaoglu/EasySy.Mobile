import {atom} from 'jotai';

export type AppTheme = 'light' | 'dark' | 'system';
export type AppLanguage = 'en' | 'tr' | 'ar';
export type AppCurrency = 'USD' | 'EUR' | 'TRY';

export const appThemeAtom = atom<AppTheme>('light');
export const appLanguageAtom = atom<AppLanguage>('en');
export const appCurrencyAtom = atom<AppCurrency>('USD');
