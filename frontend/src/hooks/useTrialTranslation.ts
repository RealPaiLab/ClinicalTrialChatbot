import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PANEL_STRINGS, type PanelStrings } from '@/constants/i18n';
import { LanguageCode, TranslationSource } from '@/constants/language';
import { trialTranslationQuery } from '@/services/translation';
import type { Trial, TrialTranslation } from '@/types/trial';

interface Selection {
  nctNumber: string;
  language: LanguageCode;
}

interface UseTrialTranslation {
  trial: Trial | null;
  language: LanguageCode | null;
  setLanguage: (language: LanguageCode | null) => void;
  strings: PanelStrings;
  isPending: boolean;
  source: TranslationSource | null;
}

function translated(trial: Trial, translation: TrialTranslation): Trial {
  const term = (name: string) => translation.cancerTypeNames[name] ?? name;
  return {
    ...trial,
    shortTitleEn: translation.shortTitle,
    officialTitleEn: translation.officialTitle,
    descriptionEn: translation.description,
    inclusionCriteriaEn: translation.inclusionCriteria,
    exclusionCriteriaEn: translation.exclusionCriteria,
    treatmentTypeNames: trial.treatmentTypeNames.map(
      (name) => translation.treatmentTypeNames[name] ?? name
    ),
    sites: trial.sites.map((site) => ({
      ...site,
      cancerTypeNames: site.cancerTypeNames.map(term),
    })),
  };
}

/**
 * Per-trial language state for the summary panel.
 *
 * The choice is deliberately not persisted: it resets whenever a different trial
 * is selected, matching the inline "translate this one thing" behaviour rather
 * than an app-wide locale.
 */
export function useTrialTranslation(trial: Trial | null): UseTrialTranslation {
  const [selection, setSelection] = useState<Selection | null>(null);
  const nctNumber = trial?.nctNumber ?? null;
  const language = selection && selection.nctNumber === nctNumber ? selection.language : null;

  const { data, isFetching } = useQuery(trialTranslationQuery(nctNumber, language));
  const isPending = Boolean(language) && isFetching;
  const usable = data && data.language === language ? data : null;

  return {
    trial:
      trial && usable && usable.source !== TranslationSource.Unavailable
        ? translated(trial, usable)
        : trial,
    language,
    setLanguage: (next) => setSelection(next && nctNumber ? { nctNumber, language: next } : null),
    strings: PANEL_STRINGS[language ?? LanguageCode.En],
    isPending,
    source: usable?.source ?? null,
  };
}
