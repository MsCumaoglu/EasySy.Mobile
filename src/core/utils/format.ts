import dayjs from 'dayjs';

export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (
  date: Date | string,
  format: string = 'MMM DD, YYYY',
): string => {
  return dayjs(date).format(format);
};

export const formatDateRange = (
  startDate: Date | string,
  endDate: Date | string,
): string => {
  return `${dayjs(startDate).format('MMM DD')} - ${dayjs(endDate).format('MMM DD, YYYY')}`;
};

export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) {
    return `${m}m`;
  }
  if (m === 0) {
    return `${h}h`;
  }
  return `${h}h ${m}m`;
};

export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};
