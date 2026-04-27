import {useAtomValue} from 'jotai';
import {appCurrencyAtom, AppCurrency} from '../../state/appAtoms';

// Mock exchange rates: 1 Target Currency = X SYP
// For a production app, these should be fetched from an API
const EXCHANGE_RATES: Record<AppCurrency, number> = {
  SYP: 1,
  USD: 15000,
  EUR: 16000,
  TRY: 450,
};

const CURRENCY_SYMBOLS: Record<AppCurrency, string> = {
  SYP: 'SYP',
  USD: '$',
  EUR: '€',
  TRY: '₺',
};

export const useCurrency = () => {
  const currency = useAtomValue(appCurrencyAtom);

  /**
   * Converts a SYP amount to the user's selected currency
   * @param amountInSyp The price in Syrian Pounds (SYP) from the API
   * @returns Formatted string with currency symbol (e.g. "$120" or "1.500 SYP")
   */
  const formatPrice = (amountInSyp: number): string => {
    if (!amountInSyp || amountInSyp <= 0) return 'Fiyat Yok';

    const activeCurrency = currency || 'USD';
    const rate = EXCHANGE_RATES[activeCurrency] || 1;
    const convertedAmount = amountInSyp / rate;
    const symbol = CURRENCY_SYMBOLS[activeCurrency] || activeCurrency;

    // Formatting rules based on currency
    if (activeCurrency === 'SYP') {
      return `${Math.round(convertedAmount).toLocaleString()} ${symbol}`;
    }

    // For others, show 2 decimal places if needed, and prefix the symbol
    const formattedAmount = convertedAmount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    return `${symbol}${formattedAmount}`;
  };

  return {
    currency,
    formatPrice,
  };
};
