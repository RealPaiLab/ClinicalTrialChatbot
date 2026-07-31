import { describe, expect, it } from 'vitest';
import {
  deriveTrialStatus,
  formatPhases,
  primarySite,
  trialStatuses,
  uniqueCancerTypes,
} from './trial';
import { mockTrials } from '@/test/fixtures/trials';

describe('trial helpers', () => {
  it('derives the highest-priority site status', () => {
    expect(deriveTrialStatus(mockTrials[0])).toBe('recruiting');
  });

  it('lists every distinct site status in priority order', () => {
    expect(trialStatuses(mockTrials[0])).toEqual(['recruiting', 'opening_soon']);
    expect(trialStatuses({ ...mockTrials[0], sites: [] })).toEqual([]);
  });

  it('prefers a recruiting site as the primary site', () => {
    expect(primarySite(mockTrials[0])?.city).toBe('Toronto');
  });

  it('collects unique cancer types across sites', () => {
    expect(uniqueCancerTypes(mockTrials[0])).toEqual(['breast cancer']);
  });

  it('formats phase codes', () => {
    expect(formatPhases(['PHASE2'])).toBe('Phase 2');
    expect(formatPhases(['PHASE2', 'PHASE3'])).toBe('Phase 2 / Phase 3');
  });
});
