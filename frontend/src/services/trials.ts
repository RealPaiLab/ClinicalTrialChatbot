import camelcaseKeys from 'camelcase-keys';
import { config } from '@/config';
import type { Trial } from '@/types/trial';

const API_BASE = config.apiBaseUrl;

export async function getTrial(trialRef: string, signal?: AbortSignal): Promise<Trial> {
  const response = await fetch(`${API_BASE}/trials/${trialRef}`, { signal });
  if (!response.ok) {
    throw new Error(`Trial request failed with status ${response.status}`);
  }
  const data = (await response.json()) as Record<string, unknown>;
  return camelcaseKeys(data, { deep: true }) as unknown as Trial;
}
