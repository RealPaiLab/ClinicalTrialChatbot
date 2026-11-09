import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useTrialTranslation } from './useTrialTranslation';
import { LanguageCode, TranslationSource } from '@/constants/language';
import { useAppStore } from '@/store/appStore';
import { mockTrials } from '@/test/fixtures/trials';
import { clientWrapper } from '@/test/render';

function stubTranslation() {
  const fetchMock = vi.fn(async () =>
    Response.json({
      trial_ref: 'CTC-4267848A',
      language: 'fr-CA',
      source: 'official',
      short_title: 'Immunothérapie',
      official_title: 'Étude de phase II du pembrolizumab',
      description: 'Cet essai évalue...',
      inclusion_criteria: 'Adultes de 18 ans et plus.',
      exclusion_criteria: 'Traitement antérieur.',
      cancer_type_names: { 'breast cancer': 'cancer du sein' },
      treatment_type_names: { immunotherapy: 'immunothérapie' },
    })
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useTrialTranslation', () => {
  it('leaves the trial untouched and skips the request while the app is in English', () => {
    const fetchMock = stubTranslation();

    const { result } = renderHook(() => useTrialTranslation(mockTrials[0]), {
      wrapper: clientWrapper(),
    });

    expect(result.current.trial).toBe(mockTrials[0]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('merges the translation over the English fields, keeping vocabulary keys as sent', async () => {
    stubTranslation();
    useAppStore.setState({ language: LanguageCode.FrCa });

    const { result } = renderHook(() => useTrialTranslation(mockTrials[0]), {
      wrapper: clientWrapper(),
    });

    await waitFor(() => expect(result.current.source).toBe(TranslationSource.Official));
    expect(result.current.trial?.officialTitleEn).toBe('Étude de phase II du pembrolizumab');
    expect(result.current.trial?.sites[0].cancerTypeNames).toEqual(['cancer du sein']);
    expect(result.current.trial?.treatmentTypeNames).toContain('immunothérapie');
  });

  it('shows demo trials as stored while the tour runs', () => {
    const fetchMock = stubTranslation();
    useAppStore.setState({ language: LanguageCode.FrCa });
    useAppStore.getState().startTour([]);

    const { result } = renderHook(() => useTrialTranslation(mockTrials[0]), {
      wrapper: clientWrapper(),
    });

    expect(result.current.trial).toBe(mockTrials[0]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
