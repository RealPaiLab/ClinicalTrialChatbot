import camelcaseKeys from 'camelcase-keys';
import { queryOptions } from '@tanstack/react-query';
import { config } from '@/config';
import type { LanguageCode } from '@/constants/language';
import type { TrialTranslation } from '@/types/trial';

const API_BASE = config.apiBaseUrl;

async function getTrialTranslation(
  nctNumber: string,
  language: LanguageCode,
  cachedOnly: boolean,
  signal?: AbortSignal
): Promise<TrialTranslation> {
  const query = new URLSearchParams({ language });
  if (cachedOnly) query.set('cached_only', 'true');
  const response = await fetch(`${API_BASE}/trials/${nctNumber}/translation?${query}`, {
    signal,
  });
  if (!response.ok) {
    throw new Error(`Translation request failed with status ${response.status}`);
  }
  const data = (await response.json()) as Record<string, unknown>;
  // Shallow on purpose: the only nested objects are the vocabulary maps, whose
  // keys are English trial terms ("breast cancer") and must not be camelized.
  return camelcaseKeys(data) as unknown as TrialTranslation;
}

export function trialTranslationQuery(
  nctNumber: string | null,
  language: LanguageCode | null,
  { cachedOnly = false }: { cachedOnly?: boolean } = {}
) {
  return queryOptions({
    queryKey: ['trial-translation', nctNumber, language, cachedOnly],
    queryFn: ({ signal }) =>
      getTrialTranslation(nctNumber as string, language as LanguageCode, cachedOnly, signal),
    enabled: Boolean(nctNumber && language),
    staleTime: Infinity,
  });
}
