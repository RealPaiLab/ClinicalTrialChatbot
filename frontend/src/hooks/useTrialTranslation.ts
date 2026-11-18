import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { LanguageCode, TranslationSource } from '@/constants/language';
import { useAppLanguage } from '@/hooks/useAppLanguage';
import { applyTranslation, usableTranslation } from '@/lib/translateTrial';
import { trialTranslationQuery } from '@/services/translation';
import { selectIsTourRunning, useAppStore } from '@/store/appStore';
import type { Trial, TrialTranslation } from '@/types/trial';

/** The language to translate trial text into, or null to show it as stored (English, or the tour's demo trials). */
function useTranslationTarget(): LanguageCode | null {
  const { language } = useAppLanguage();
  const isTourRunning = useAppStore(selectIsTourRunning);
  return language === LanguageCode.En || isTourRunning ? null : language;
}

interface UseTrialTranslation {
  trial: Trial | null;
  isPending: boolean;
  source: TranslationSource | null;
}

/** Commissions a translation: only the summary panel does this. */
export function useTrialTranslation(trial: Trial | null): UseTrialTranslation {
  const target = useTranslationTarget();
  const { data, isFetching } = useQuery(trialTranslationQuery(trial?.trialRef ?? null, target));
  const usable = usableTranslation(data, target);

  return {
    trial: trial && usable ? applyTranslation(trial, usable) : trial,
    isPending: isFetching,
    source: data && data.language === target ? data.source : null,
  };
}

// Module-level so useQueries keeps the combined array stable until a translation lands: the map re-pins on every new array.
const translationData = (queries: { data?: TrialTranslation }[]) =>
  queries.map((query) => query.data);

/** Swaps in translations the server already holds; never commissions one. */
export function useCachedTrialTranslations(trials: Trial[]): Trial[] {
  const target = useTranslationTarget();
  const results = useQueries({
    queries: trials.map((trial) =>
      trialTranslationQuery(trial.trialRef, target, { cachedOnly: true })
    ),
    combine: translationData,
  });

  return useMemo(
    () =>
      trials.map((trial, index) => {
        const translation = usableTranslation(results[index], target);
        return translation ? applyTranslation(trial, translation) : trial;
      }),
    [trials, target, results]
  );
}
