import { queryOptions } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import type { TrialContacts } from '@/types/contact';

/** Coordinator details are only ever fetched when the contact dialog opens. */
export function trialContactsQuery(trialRef: string) {
  return queryOptions({
    queryKey: ['trial-contacts', trialRef],
    queryFn: ({ signal }) => apiGet<TrialContacts>(`/trials/${trialRef}/contacts`, { signal }),
  });
}
