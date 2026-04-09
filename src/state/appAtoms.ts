import {atom} from 'jotai';

export type AppTheme = 'light' | 'dark' | 'system';
export type AppLanguage = 'en' | 'tr' | 'ar';

export const appThemeAtom = atom<AppTheme>('light');

export const appLanguageAtom = atom<AppLanguage>('en');
