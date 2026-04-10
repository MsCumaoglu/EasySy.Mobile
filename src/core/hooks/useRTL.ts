import {I18nManager} from 'react-native';
import {useTranslation} from 'react-i18next';

/**
 * RTL helper hook.
 *
 * IMPORTANT — React Native RTL architecture:
 *  When I18nManager.forceRTL(true) is active, React Native automatically
 *  mirrors ALL flexDirection:'row' to flow right-to-left.
 *  Therefore we must NOT manually flip flexDirection in components —
 *  that would cause a double-flip and make Arabic look like LTR.
 *
 * This hook provides:
 *  - `isRTL`   : whether the app is currently in RTL mode  (read from I18nManager)
 *  - `flipIcon`: flips directional icon names (arrow-back ↔ arrow-forward)
 *                for icons that must point the other way in RTL.
 */
export const useRTL = () => {
  const {i18n} = useTranslation();
  // Always read from I18nManager so it reflects the forceRTL call in App.tsx
  const isRTL = i18n.language === 'ar';

  /** Flip a directional icon name for RTL */
  const flipIcon = (ltrName: string): string => {
    if (!isRTL) return ltrName;
    const map: Record<string, string> = {
      'arrow-back': 'arrow-forward',
      'arrow-forward': 'arrow-back',
      'chevron-back': 'chevron-forward',
      'chevron-forward': 'chevron-back',
      'caret-back': 'caret-forward',
      'caret-forward': 'caret-back',
    };
    return map[ltrName] ?? ltrName;
  };

  return {isRTL, flipIcon};
};
