import { queryOptions } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import type { DataFreshness } from '@/types/trial';

export function dataFreshnessQuery() {
  return queryOptions({
    queryKey: ['data-freshness'],
    queryFn: ({ signal }) => apiGet<DataFreshness>('/meta/data-freshness', { signal }),
  });
}
