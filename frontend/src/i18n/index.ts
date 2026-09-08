import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { AGENT_NAME } from '@/constants/chat';
import { LanguageCode } from '@/constants/language';
import de from '@/i18n/locales/de';
import en from '@/i18n/locales/en';
import es from '@/i18n/locales/es';
import frCa from '@/i18n/locales/fr-CA';
import hi from '@/i18n/locales/hi';
import yue from '@/i18n/locales/yue';
import zhCn from '@/i18n/locales/zh-CN';

export const resources = {
  [LanguageCode.En]: { translation: en },
  [LanguageCode.FrCa]: { translation: frCa },
  [LanguageCode.Es]: { translation: es },
  [LanguageCode.De]: { translation: de },
  [LanguageCode.Hi]: { translation: hi },
  [LanguageCode.ZhCn]: { translation: zhCn },
  [LanguageCode.Yue]: { translation: yue },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: LanguageCode.En,
  fallbackLng: LanguageCode.En,
  supportedLngs: Object.values(LanguageCode),
  interpolation: {
    escapeValue: false,
    defaultVariables: { agent: AGENT_NAME },
  },
});

export default i18n;
