import { TranslationSource } from '@/constants/language';
import type { LanguageCode } from '@/constants/language';
import type { Trial, TrialTranslation } from '@/types/trial';

/** A translation is usable when it is the language asked for and has text. */
export function usableTranslation(
  translation: TrialTranslation | undefined,
  language: LanguageCode | null
): TrialTranslation | null {
  return translation &&
    translation.language === language &&
    translation.source !== TranslationSource.Unavailable
    ? translation
    : null;
}

/** The trial with its narrative and vocabulary swapped for the translated text. */
export function applyTranslation(trial: Trial, translation: TrialTranslation): Trial {
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
