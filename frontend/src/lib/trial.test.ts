import { describe, expect, it } from 'vitest';
import {
  deriveTrialStatus,
  formatPhases,
  normalizeStatus,
  primarySite,
  trialStatuses,
  uniqueCancerTypes,
} from './trial';
import { mockTrials } from '@/test/fixtures/trials';

describe('normalizeStatus', () => {
  it('maps registry states onto the shown statuses', () => {
    expect(normalizeStatus('Recruiting')).toBe('recruiting');
    expect(normalizeStatus('Not yet recruiting')).toBe('opening_soon');
  });

  it('returns null for unsupported or empty states', () => {
    expect(normalizeStatus('Completed')).toBeNull();
    expect(normalizeStatus(null)).toBeNull();
  });
});

describe('trial helpers', () => {
  it('derives the highest-priority site status', () => {
    expect(deriveTrialStatus(mockTrials[0])).toBe('recruiting');
  });

  it('lists every distinct site status in priority order', () => {
    expect(trialStatuses(mockTrials[0])).toEqual(['recruiting', 'opening_soon']);
    expect(trialStatuses({ ...mockTrials[0], sites: [] })).toEqual([]);
  });

  it('prefers a recruiting site as the primary site', () => {
    const openingFirst = { ...mockTrials[0], sites: [...mockTrials[0].sites].reverse() };
    expect(openingFirst.sites[0].city).toBe('Montreal');
    expect(primarySite(openingFirst)?.city).toBe('Toronto');
  });

  it('collects unique cancer types across sites', () => {
    expect(uniqueCancerTypes(mockTrials[0])).toEqual(['breast cancer']);
  });

  it('formats phase codes', () => {
    expect(formatPhases(['PHASE2'])).toBe('Phase 2');
    expect(formatPhases(['PHASE2', 'PHASE3'])).toBe('Phase 2 / Phase 3');
  });
});
