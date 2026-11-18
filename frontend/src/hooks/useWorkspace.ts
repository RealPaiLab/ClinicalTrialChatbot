import { useCachedTrialTranslations } from '@/hooks/useTrialTranslation';
import { useAppStore } from '@/store/appStore';
import type { Trial } from '@/types/trial';

/** The trials on the map, with any translation already cached; the summary panel is the one surface that commissions one. */
export function useMapTrials(): Trial[] {
  return useCachedTrialTranslations(useAppStore((state) => state.trials));
}

export function useContextTrials(): Trial[] {
  const contextTrialRefs = useAppStore((state) => state.contextTrialRefs);
  const trials = useMapTrials();
  return contextTrialRefs.flatMap((ref) => trials.filter((trial) => trial.trialRef === ref));
}

interface SelectedTrial {
  trial: Trial | null;
  /** The map pin's site, when a pin rather than a citation chose the trial. */
  siteKey: string | null;
  isInContext: boolean;
  isBookmarked: boolean;
}

/** The selected trial as stored, in English: the summary panel translates it itself. */
export function useSelectedTrial(): SelectedTrial {
  const trial = useAppStore(
    (state) =>
      state.trials.find((candidate) => candidate.trialRef === state.selectedTrialRef) ?? null
  );
  const siteKey = useAppStore((state) => state.selectedSiteKey);
  const isInContext = useAppStore(
    (state) => trial !== null && state.contextTrialRefs.includes(trial.trialRef)
  );
  const isBookmarked = useAppStore(
    (state) => trial !== null && state.bookmarkedTrialRefs.includes(trial.trialRef)
  );

  return { trial, siteKey, isInContext, isBookmarked };
}
