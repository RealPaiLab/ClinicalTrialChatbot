import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@/lib/queryClient';
import { trialQuery } from '@/services/trials';
import type { Trial } from '@/types/trial';

/** Renders with a fresh query client, holding `trials` as if a chat turn had returned them. */
export function renderWithClient(ui: ReactElement, { trials = [] }: { trials?: Trial[] } = {}) {
  const client = createQueryClient();
  trials.forEach((trial) => client.setQueryData(trialQuery(trial.trialRef).queryKey, trial));
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

export function clientWrapper() {
  const client = createQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}
