import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useTrialTranslation } from './useTrialTranslation';
import { LanguageCode, TranslationSource } from '@/constants/language';
import { createQueryClient } from '@/lib/queryClient';
import { mockTrials } from '@/test/fixtures/trials';

// The app language lives in the persisted store; the hook only needs to read it.
const language = vi.hoisted(() => ({ current: 'en' as LanguageCode }));

vi.mock('@/hooks/useAppLanguage', () => ({
  useAppLanguage: () => ({ language: language.current, setLanguage: vi.fn() }),
}));

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={createQueryClient()}>{children}</QueryClientProvider>;
}

function mockTranslation() {
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
    }),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  language.current = LanguageCode.En;
});

describe('useTrialTranslation', () => {
  it('leaves the trial untouched and skips the request while the app is in English', () => {
    const fetchMock = mockTranslation();
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useTrialTranslation(mockTrials[0]), { wrapper });

    expect(result.current.trial).toBe(mockTrials[0]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('merges the translation over the English fields once the app language changes', async () => {
    vi.stubGlobal('fetch', mockTranslation());
    language.current = LanguageCode.FrCa;

    const { result } = renderHook(() => useTrialTranslation(mockTrials[0]), { wrapper });

    await waitFor(() => expect(result.current.source).toBe(TranslationSource.Official));
    expect(result.current.trial?.officialTitleEn).toBe('Étude de phase II du pembrolizumab');
    expect(result.current.trial?.sites[0].cancerTypeNames).toEqual(['cancer du sein']);
  });
});
