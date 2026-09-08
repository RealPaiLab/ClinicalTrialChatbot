import camelcaseKeys from 'camelcase-keys';
import { queryOptions } from '@tanstack/react-query';
import { config } from '@/config';
import type { DataFreshness } from '@/types/trial';

const API_BASE = config.apiBaseUrl;

async function getDataFreshness(signal?: AbortSignal): Promise<DataFreshness> {
  const response = await fetch(`${API_BASE}/meta/data-freshness`, { signal });
  if (!response.ok) {
    throw new Error(`Data freshness request failed with status ${response.status}`);
  }
  const data = (await response.json()) as Record<string, unknown>;
  return camelcaseKeys(data, { deep: true }) as unknown as DataFreshness;
}

export function dataFreshnessQuery() {
  return queryOptions({
    queryKey: ['data-freshness'],
    queryFn: ({ signal }) => getDataFreshness(signal),
    staleTime: Infinity,
    retry: 2,
  });
}
