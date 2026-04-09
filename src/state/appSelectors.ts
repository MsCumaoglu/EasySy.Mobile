import {atom} from 'jotai';
import {appThemeAtom} from './appAtoms';
import {lightColors, darkColors} from '../core/constants/colors';

export const themeColorsSelector = atom((get) => {
  const theme = get(appThemeAtom);
  return theme === 'dark' ? darkColors : lightColors;
});

export const isDarkModeSelector = atom((get) => {
  const theme = get(appThemeAtom);
  return theme === 'dark';
});
