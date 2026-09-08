import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppLanguage } from '@/hooks/useAppLanguage';
import { formatDataDate } from '@/lib/dataDate';
import { dataFreshnessQuery } from '@/services/dataFreshness';

interface UseDataFreshness {
  updatedOn: string | null;
}

export function useDataFreshness(): UseDataFreshness {
  const { data } = useQuery(dataFreshnessQuery());
  const { language } = useAppLanguage();
  const publishedAt = data?.publishedAt ?? null;

  const updatedOn = useMemo(
    () => (publishedAt === null ? null : formatDataDate(publishedAt, language)),
    [publishedAt, language]
  );

  return { updatedOn };
}
