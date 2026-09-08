import { useQuery } from '@tanstack/react-query';
import { LanguageCode, TranslationSource } from '@/constants/language';
import { useAppLanguage } from '@/hooks/useAppLanguage';
import { applyTranslation, usableTranslation } from '@/lib/translateTrial';
import { trialTranslationQuery } from '@/services/translation';
import { useAppStore } from '@/store/appStore';
import type { Trial } from '@/types/trial';

interface UseTrialTranslation {
  trial: Trial | null;
  isPending: boolean;
  source: TranslationSource | null;
}

export function useTrialTranslation(trial: Trial | null): UseTrialTranslation {
  const { language } = useAppLanguage();
  const isTourRunning = useAppStore((state) => state.tourMessages.length > 0);
  const trialRef = trial?.trialRef ?? null;
  const target = language === LanguageCode.En || isTourRunning ? null : language;

  const { data, isFetching } = useQuery(trialTranslationQuery(trialRef, target));
  const isPending = Boolean(target) && isFetching;
  const usable = usableTranslation(data, target);

  return {
    trial: trial && usable ? applyTranslation(trial, usable) : trial,
    isPending,
    source: data && data.language === target ? data.source : null,
  };
}
