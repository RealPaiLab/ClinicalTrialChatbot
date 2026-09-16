import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppLanguage } from '@/hooks/useAppLanguage';
import { formatDataDate } from '@/lib/dataDate';
import { dataFreshnessQuery } from '@/services/dataFreshness';
import type { TrialSourceCode } from '@/constants/trialSources';

export interface SourceUpdate {
  source: TrialSourceCode;
  updatedOn: string | null;
}

interface UseDataFreshness {
  updatedOn: string | null;
  sources: SourceUpdate[];
}

export function useDataFreshness(): UseDataFreshness {
  const { data } = useQuery(dataFreshnessQuery());
  const { language } = useAppLanguage();
  const publishedAt = data?.publishedAt ?? null;
  const entries = data?.sources;

  const updatedOn = useMemo(
    () => (publishedAt === null ? null : formatDataDate(publishedAt, language)),
    [publishedAt, language]
  );
  const sources = useMemo(
    () =>
      (entries ?? []).map(({ source, publishedAt: date }) => ({
        source,
        updatedOn: date === null ? null : formatDataDate(date, language),
      })),
    [entries, language]
  );

  return { updatedOn, sources };
}
