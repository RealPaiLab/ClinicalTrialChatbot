import camelcaseKeys from 'camelcase-keys';
import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { config } from '@/config';
import type { Trial } from '@/types/trial';

const API_BASE = config.apiBaseUrl;

export interface DebugSearchParams {
  cancerTypes?: string[];
  locations?: string[];
  statuses?: string[];
  phases?: string[];
  treatmentTypes?: string[];
  diseaseStages?: string[];
  query?: string;
  semantic?: string;
  embeddingProvider?: string;
  limit?: number;
  offset?: number;
}

function buildQuery(params: DebugSearchParams): string {
  const search = new URLSearchParams();
  const lists: Record<string, string[] | undefined> = {
    cancer_types: params.cancerTypes,
    locations: params.locations,
    statuses: params.statuses,
    phases: params.phases,
    treatment_types: params.treatmentTypes,
    disease_stages: params.diseaseStages,
  };
  for (const [key, values] of Object.entries(lists)) {
    for (const value of values ?? []) {
      if (value.trim()) search.append(key, value.trim());
    }
  }
  if (params.query?.trim()) search.set('query', params.query.trim());
  if (params.semantic?.trim()) search.set('semantic', params.semantic.trim());
  if (params.embeddingProvider) search.set('embedding_provider', params.embeddingProvider);
  if (params.limit != null) search.set('limit', String(params.limit));
  if (params.offset != null) search.set('offset', String(params.offset));
  return search.toString();
}

async function searchTrials(params: DebugSearchParams, signal?: AbortSignal): Promise<Trial[]> {
  const response = await fetch(`${API_BASE}/debug/trials?${buildQuery(params)}`, { signal });
  if (!response.ok) {
    throw new Error(`Debug trial search failed with status ${response.status}`);
  }
  const data = (await response.json()) as Record<string, unknown>[];
  return camelcaseKeys(data, { deep: true }) as unknown as Trial[];
}

export function debugTrialsQuery(params: DebugSearchParams) {
  return queryOptions({
    queryKey: ['debug-trials', params],
    queryFn: ({ signal }) => searchTrials(params, signal),
    placeholderData: keepPreviousData,
  });
}
