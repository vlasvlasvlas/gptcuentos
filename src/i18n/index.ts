import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import es from './locales/es';
import en from './locales/en';

export const defaultNS = 'translation';
export const resources = { es, en };

i18n.use(initReactI18next).init({
  resources,
  defaultNS,
  lng: 'es',
});

export default i18n;
