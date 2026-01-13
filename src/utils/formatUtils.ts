import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Safely format a number with Vietnamese locale
 */
export const formatNumber = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return '0';
  }
  return Number(value).toLocaleString('vi-VN');
};

/**
 * Safely format a date with Vietnamese locale
 */
export const formatDate = (date: Date | string | number | undefined | null): string => {
  if (!date) return 'Chưa có';

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Ngày không hợp lệ';
    }

    return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: vi });
  } catch (error) {
    console.warn('Date formatting error:', error);
    return 'Lỗi định dạng ngày';
  }
};

/**
 * Safely format a date only (no time)
 */
export const formatDateOnly = (date: Date | string | number | undefined | null): string => {
  if (!date) return 'Chưa có';

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Ngày không hợp lệ';
    }

    return format(dateObj, 'dd/MM/yyyy', { locale: vi });
  } catch (error) {
    console.warn('Date formatting error:', error);
    return 'Lỗi định dạng ngày';
  }
};

/**
 * Safely format currency in VND
 */
export const formatCurrency = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return '0 ₫';
  }
  return `${Number(value).toLocaleString('vi-VN')} ₫`;
};

/**
 * Safely format percentage
 */
export const formatPercentage = (value: number | string | undefined | null, decimals: number = 1): string => {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return '0%';
  }
  return `${Number(value).toFixed(decimals)}%`;
};