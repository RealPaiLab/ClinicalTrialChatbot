import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { LanguageCode } from '@/constants/language';
import { useAppStore } from '@/store/appStore';

interface UseAppLanguage {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
}

/**
 * The store is the single source of truth for the app language: i18next and the
 * document follow it, so a persisted choice survives a reload without i18next
 * needing its own detector or storage.
 */
export function useAppLanguage(): UseAppLanguage {
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language !== language) {
      void i18n.changeLanguage(language);
    }
    document.documentElement.lang = language;
  }, [i18n, language]);

  return { language, setLanguage };
}
