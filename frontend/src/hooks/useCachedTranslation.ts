import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { LanguageCode } from '@/constants/language';
import { useAppLanguage } from '@/hooks/useAppLanguage';
import { applyTranslation, usableTranslation } from '@/lib/translateTrial';
import { trialTranslationQuery } from '@/services/translation';
import { useAppStore } from '@/store/appStore';
import type { Trial, TrialTranslation } from '@/types/trial';

function useTarget(): LanguageCode | null {
  const { language } = useAppLanguage();
  const isTourRunning = useAppStore((state) => state.tourMessages.length > 0);
  return language === LanguageCode.En || isTourRunning ? null : language;
}

export function useCachedTrialTranslation(nctNumber: string | null): TrialTranslation | null {
  const target = useTarget();
  const { data } = useQuery(trialTranslationQuery(nctNumber, target, { cachedOnly: true }));
  return usableTranslation(data, target);
}

export function useCachedTrialTranslations(trials: Trial[]): Trial[] {
  const target = useTarget();
  const results = useQueries({
    queries: trials.map((trial) =>
      trialTranslationQuery(trial.nctNumber, target, { cachedOnly: true })
    ),
  });

  // The map recomputes its pins whenever this array changes identity, so it is
  // rebuilt only when a translation actually lands.
  const stamp = results.map((result) => result.dataUpdatedAt).join('|');
  return useMemo(
    () =>
      trials.map((trial, index) => {
        const translation = usableTranslation(results[index]?.data, target);
        return translation ? applyTranslation(trial, translation) : trial;
      }),
    [trials, target, stamp]
  );
}
