import React, {createContext, useContext} from 'react';
import {useAtomValue} from 'jotai';
import {themeColorsSelector} from '../../state/appSelectors';
import {AppColors} from '../../core/constants/colors';
import {spacing, Spacing} from '../../core/constants/spacing';
import {radius, Radius} from '../../core/constants/radius';
import {typography} from '../../core/constants/typography';

interface Theme {
  colors: AppColors;
  spacing: Spacing;
  radius: Radius;
  typography: typeof typography;
  isDark: boolean;
}

const ThemeContext = createContext<Theme | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({children}) => {
  const colors = useAtomValue(themeColorsSelector);

  const theme: Theme = {
    colors,
    spacing,
    radius,
    typography,
    isDark: colors.background === '#2b2928',
  };

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): Theme => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
};

export default ThemeProvider;
