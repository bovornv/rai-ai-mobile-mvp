import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import th from '../locales/th.json';
import en from '../locales/en.json';

const resources = {
  th: { translation: th },
  en: { translation: en },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'th', // Default language
    fallbackLng: 'th',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Disable suspense for web compatibility
    },
  });

export default i18n;
