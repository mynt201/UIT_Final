import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { vi } from './locales/vi';
import { en } from './locales/en';

const DEFAULT_LANG = 'vi';

function getInitialLanguage(): string {
  try {
    const raw = localStorage.getItem('appSettings');
    if (raw) {
      const p = JSON.parse(raw);
      if (p?.language === 'en' || p?.language === 'vi') return p.language;
    }
  } catch {
    // ignore
  }
  return DEFAULT_LANG;
}

i18n.use(initReactI18next).init({
  resources: {
    vi: { translation: vi as Record<string, unknown> },
    en: { translation: en as Record<string, unknown> },
  },
  lng: getInitialLanguage(),
  fallbackLng: DEFAULT_LANG,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
