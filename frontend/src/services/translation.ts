import { queryOptions, skipToken } from '@tanstack/react-query';
import type { LanguageCode } from '@/constants/language';
import { apiGet } from '@/services/api';
import type { TrialTranslation } from '@/types/trial';

// The vocabulary maps are keyed by English trial terms ("breast cancer"), not field names.
const VOCABULARY_PATHS = ['cancer_type_names', 'treatment_type_names'];

/** No trial, or a null language (shown as stored), fetches nothing. */
export function trialTranslationQuery(
  trialRef: string | null,
  language: LanguageCode | null,
  { cachedOnly = false }: { cachedOnly?: boolean } = {}
) {
  return queryOptions({
    queryKey: ['trial-translation', trialRef, language, cachedOnly],
    queryFn:
      trialRef && language
        ? ({ signal }) => {
            const query = new URLSearchParams({ language });
            if (cachedOnly) query.set('cached_only', 'true');
            return apiGet<TrialTranslation>(`/trials/${trialRef}/translation?${query}`, {
              signal,
              stopPaths: VOCABULARY_PATHS,
            });
          }
        : skipToken,
  });
}
