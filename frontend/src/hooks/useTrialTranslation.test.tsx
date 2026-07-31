import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useTrialTranslation } from './useTrialTranslation';
import { LanguageCode, TranslationSource } from '@/constants/language';
import { createQueryClient } from '@/lib/queryClient';
import { mockTrials } from '@/test/fixtures/trials';
import type { Trial } from '@/types/trial';

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={createQueryClient()}>{children}</QueryClientProvider>;
}

function mockTranslation(overrides: Record<string, unknown> = {}) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      nct_number: 'NCT04267848',
      language: 'fr-CA',
      source: 'official',
      short_title: 'Immunothérapie',
      official_title: 'Étude de phase II du pembrolizumab',
      description: 'Cet essai évalue...',
      inclusion_criteria: 'Adultes de 18 ans et plus.',
      exclusion_criteria: 'Traitement antérieur.',
      cancer_type_names: { 'breast cancer': 'cancer du sein' },
      treatment_type_names: { immunotherapy: 'immunothérapie' },
      ...overrides,
    }),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useTrialTranslation', () => {
  it('returns the untouched trial and English labels before a language is picked', () => {
    const fetchMock = mockTranslation();
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useTrialTranslation(mockTrials[0]), { wrapper });

    expect(result.current.language).toBeNull();
    expect(result.current.trial).toBe(mockTrials[0]);
    expect(result.current.strings.whoCanJoin).toBe('Who can join');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('merges the translation over the English fields once a language is picked', async () => {
    vi.stubGlobal('fetch', mockTranslation());

    const { result } = renderHook(() => useTrialTranslation(mockTrials[0]), { wrapper });
    act(() => result.current.setLanguage(LanguageCode.FrCa));

    await waitFor(() => expect(result.current.source).toBe(TranslationSource.Official));
    expect(result.current.trial?.officialTitleEn).toBe('Étude de phase II du pembrolizumab');
    expect(result.current.trial?.inclusionCriteriaEn).toBe('Adultes de 18 ans et plus.');
    expect(result.current.trial?.sites[0].cancerTypeNames).toEqual(['cancer du sein']);
    expect(result.current.trial?.treatmentTypeNames).toContain('immunothérapie');
    expect(result.current.strings.whoCanJoin).toBe('Qui peut participer');
  });

  it('keeps the English text when the provider is unavailable', async () => {
    vi.stubGlobal('fetch', mockTranslation({ source: 'unavailable' }));

    const { result } = renderHook(() => useTrialTranslation(mockTrials[0]), { wrapper });
    act(() => result.current.setLanguage(LanguageCode.FrCa));

    await waitFor(() => expect(result.current.source).toBe(TranslationSource.Unavailable));
    expect(result.current.trial?.officialTitleEn).toBe(mockTrials[0].officialTitleEn);
  });

  it('resets to the original when the language is cleared', async () => {
    vi.stubGlobal('fetch', mockTranslation());

    const { result } = renderHook(() => useTrialTranslation(mockTrials[0]), { wrapper });
    act(() => result.current.setLanguage(LanguageCode.FrCa));
    await waitFor(() => expect(result.current.source).toBe(TranslationSource.Official));

    act(() => result.current.setLanguage(null));

    expect(result.current.language).toBeNull();
    expect(result.current.trial).toBe(mockTrials[0]);
  });

  it('resets the language when a different trial is selected', async () => {
    vi.stubGlobal('fetch', mockTranslation());

    const { result, rerender } = renderHook((trial: Trial) => useTrialTranslation(trial), {
      wrapper,
      initialProps: mockTrials[0],
    });
    act(() => result.current.setLanguage(LanguageCode.FrCa));
    await waitFor(() => expect(result.current.language).toBe(LanguageCode.FrCa));

    rerender(mockTrials[1]);

    expect(result.current.language).toBeNull();
    expect(result.current.trial).toBe(mockTrials[1]);
  });
});
