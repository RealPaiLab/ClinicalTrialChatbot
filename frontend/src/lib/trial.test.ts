import { describe, expect, it } from 'vitest';
import { deriveTrialStatus, formatPhases, primarySite, uniqueCancerTypes } from './trial';
import { mockTrials } from '@/test/fixtures/trials';

describe('trial helpers', () => {
  it('derives the highest-priority site status', () => {
    expect(deriveTrialStatus(mockTrials[0])).toBe('recruiting');
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
