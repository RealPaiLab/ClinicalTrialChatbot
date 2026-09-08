import camelcaseKeys from 'camelcase-keys';
import { queryOptions } from '@tanstack/react-query';
import { config } from '@/config';
import type { TrialContacts } from '@/types/contact';

const API_BASE = config.apiBaseUrl;

async function getTrialContacts(trialRef: string, signal?: AbortSignal): Promise<TrialContacts> {
  const response = await fetch(`${API_BASE}/trials/${trialRef}/contacts`, { signal });
  if (!response.ok) {
    throw new Error(`Contacts request failed with status ${response.status}`);
  }
  const data = (await response.json()) as Record<string, unknown>;
  return camelcaseKeys(data, { deep: true }) as unknown as TrialContacts;
}

/** Coordinator details are only ever fetched when the contact dialog opens. */
export function trialContactsQuery(trialRef: string | null) {
  return queryOptions({
    queryKey: ['trial-contacts', trialRef],
    queryFn: ({ signal }) => getTrialContacts(trialRef as string, signal),
    enabled: Boolean(trialRef),
    staleTime: Infinity,
  });
}
