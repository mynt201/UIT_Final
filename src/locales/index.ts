import { vi } from './vi';
import { en } from './en';

export type Locale = 'vi' | 'en';

export const locales = { vi, en } as const;

function getByPath(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const p of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[p];
  }
  return typeof current === 'string' ? current : undefined;
}

export function t(lang: Locale, key: string): string {
  const dict = locales[lang];
  const value = getByPath(dict as Record<string, unknown>, key);
  return value ?? key;
}

export { vi, en };
