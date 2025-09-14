import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import your translation files
import enTranslations from './locales/en.json';
import drTranslations from './locales/dr.json';
import psTranslations from './locales/ps.json';

const resources = {
  en: {
    translation: enTranslations
  },
  dr: {
    translation: drTranslations
  },
  ps: {
    translation: psTranslations
  }
};

// Only initialize if not already initialized
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: 'en', // default language
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      react: {
        useSuspense: false,
      },
    });
}

export default i18n;
