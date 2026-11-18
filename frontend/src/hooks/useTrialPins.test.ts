import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useTrialPins } from './useTrialPins';
import { mockTrials } from '@/test/fixtures/trials';
import type { Trial } from '@/types/trial';

const [recruitingInToronto] = mockTrials;
const toronto = recruitingInToronto.sites[0];
const openingInToronto: Trial = {
  ...mockTrials[1],
  sites: [{ ...toronto, state: 'Not yet recruiting' }],
};
const notShown: Trial = {
  ...mockTrials[2],
  sites: [
    { ...toronto, state: 'Completed' },
    { ...toronto, lat: null, lon: null },
  ],
};

describe('useTrialPins', () => {
  it('stacks trials at one location into one pin, recruiting first, and skips unshowable sites', () => {
    const { result } = renderHook(() =>
      useTrialPins([openingInToronto, recruitingInToronto, notShown])
    );
    const torontoPin = result.current.units.find((unit) => unit.locationName === toronto.nameEn);

    expect(torontoPin?.items.map((item) => item.status)).toEqual(['recruiting', 'opening_soon']);
    expect(result.current.markers.some((marker) => marker.trial === notShown)).toBe(false);
  });
});
