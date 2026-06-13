import camelcaseKeys from 'camelcase-keys';
import type { TrialSummary } from '@/types/trial';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export async function getTrialSummary(
  nctNumber: string,
  signal?: AbortSignal
): Promise<TrialSummary> {
  const response = await fetch(`${API_BASE}/trials/${nctNumber}`, { signal });
  if (!response.ok) {
    throw new Error(`Trial request failed with status ${response.status}`);
  }
  const data = (await response.json()) as Record<string, unknown>;
  return camelcaseKeys(data, { deep: true }) as unknown as TrialSummary;
}
