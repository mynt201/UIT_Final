import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

type DateFormatKey = 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';

const FORMAT_MAP: Record<DateFormatKey, string> = {
  'dd/mm/yyyy': 'dd/MM/yyyy',
  'mm/dd/yyyy': 'MM/dd/yyyy',
  'yyyy-mm-dd': 'yyyy-MM-dd',
};

function getDateFormat(): DateFormatKey {
  try {
    const saved = localStorage.getItem('appSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.dateFormat && FORMAT_MAP[parsed.dateFormat as DateFormatKey]) {
        return parsed.dateFormat;
      }
    }
  } catch {
    // ignore
  }
  return 'dd/mm/yyyy';
}

/**
 * Safely format a number with comma as thousands separator (dấu phẩy cho hàng nghìn)
 */
export const formatNumber = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return '0';
  }
  return Number(value).toLocaleString('en-US', { maximumFractionDigits: 10 });
};

/**
 * Safely format a date with Vietnamese locale (uses dateFormat from settings)
 */
export const formatDate = (date: Date | string | number | undefined | null): string => {
  if (!date) return 'Chưa có';

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Ngày không hợp lệ';
    }
    const fmt = FORMAT_MAP[getDateFormat()];
    return format(dateObj, `${fmt} HH:mm`, { locale: vi });
  } catch (error) {
    console.warn('Date formatting error:', error);
    return 'Lỗi định dạng ngày';
  }
};

/**
 * Safely format a date only (no time, uses dateFormat from settings)
 */
export const formatDateOnly = (date: Date | string | number | undefined | null): string => {
  if (!date) return 'Chưa có';

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Ngày không hợp lệ';
    }
    return format(dateObj, FORMAT_MAP[getDateFormat()], { locale: vi });
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