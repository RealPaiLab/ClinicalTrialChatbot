import { describe, expect, it } from 'vitest';
import { TRIAL_STATUS, normalizeStatus } from './trialStatus';

describe('normalizeStatus', () => {
  it('maps recruiting states', () => {
    expect(normalizeStatus('Recruiting')).toBe('recruiting');
  });

  it('maps not-yet-recruiting to opening_soon', () => {
    expect(normalizeStatus('Not yet recruiting')).toBe('opening_soon');
  });

  it('returns null for unsupported or empty states', () => {
    expect(normalizeStatus('Completed')).toBeNull();
    expect(normalizeStatus(null)).toBeNull();
    expect(normalizeStatus(undefined)).toBeNull();
  });
});

describe('TRIAL_STATUS', () => {
  it('exposes a label for each status', () => {
    expect(TRIAL_STATUS.recruiting.label).toBe('Recruiting');
    expect(TRIAL_STATUS.opening_soon.label).toBe('Opening soon');
  });
});
