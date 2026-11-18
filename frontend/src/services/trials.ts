import { queryOptions } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import type { Trial } from '@/types/trial';

export const TRIAL_QUERY_ROOT = ['trial'] as const;

/** Chat results and the tour seed this cache, so a cited trial is fetched only when unseen. */
export function trialQuery(trialRef: string) {
  return queryOptions({
    queryKey: [...TRIAL_QUERY_ROOT, trialRef],
    queryFn: ({ signal }) => apiGet<Trial>(`/trials/${trialRef}`, { signal }),
  });
}
