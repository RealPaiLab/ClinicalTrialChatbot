import type { TrialSummary } from '@/types/trial';
import { mockTrials } from '@/test/fixtures/trials';

const FETCH_DELAY_MS = 150;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getTrialSummaryMock(
  nctNumber: string,
  signal?: AbortSignal
): Promise<TrialSummary> {
  await delay(FETCH_DELAY_MS);
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }
  const trial = mockTrials.find((item) => item.nctNumber === nctNumber);
  if (!trial) {
    throw new Error(`No trial found for ${nctNumber}`);
  }
  return {
    nctNumber: trial.nctNumber,
    shortTitleEn: trial.shortTitleEn,
    officialTitleEn: trial.officialTitleEn,
    descriptionEn: trial.descriptionEn,
  };
}
