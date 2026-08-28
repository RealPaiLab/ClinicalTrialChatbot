import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LanguageCode } from '@/constants/language';
import type { ChatMessage, Trial } from '@/types/trial';

export type Theme = 'light' | 'dark';

interface AppState {
  trials: Trial[];
  selectedTrialRef: string | null;
  selectedSiteKey: string | null;
  contextTrialRefs: string[];
  bookmarkedTrialRefs: string[];
  /** Trials put on the map from the saved list rather than by a chat turn. */
  bookmarkTrialRefs: string[];
  theme: Theme;
  language: LanguageCode;
  hasChosenLanguage: boolean;
  hasSeenTour: boolean;
  tourMessages: ChatMessage[];

  setTrials: (trials: Trial[]) => void;
  selectTrial: (trialRef: string | null, siteKey?: string | null) => void;
  addToContext: (trialRef: string) => void;
  removeFromContext: (trialRef: string) => void;
  clearContext: () => void;
  toggleBookmark: (trialRef: string) => void;
  removeBookmark: (trialRef: string) => void;
  addBookmarkTrial: (trial: Trial) => void;
  dropBookmarkTrial: (trialRef: string) => void;
  reset: () => void;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: LanguageCode) => void;
  markLanguageChosen: () => void;
  markTourSeen: () => void;
  setTourMessages: (messages: ChatMessage[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      trials: [],
      selectedTrialRef: null,
      selectedSiteKey: null,
      contextTrialRefs: [],
      bookmarkedTrialRefs: [],
      bookmarkTrialRefs: [],
      theme: 'light',
      language: LanguageCode.En,
      hasChosenLanguage: false,
      hasSeenTour: false,
      tourMessages: [],

      // A chat turn owns the map: whatever a bookmark added is superseded by it.
      setTrials: (trials) => set({ trials, bookmarkTrialRefs: [] }),
      selectTrial: (selectedTrialRef, selectedSiteKey = null) =>
        set({ selectedTrialRef, selectedSiteKey }),
      addToContext: (trialRef) =>
        set((state) =>
          state.contextTrialRefs.includes(trialRef)
            ? state
            : { contextTrialRefs: [...state.contextTrialRefs, trialRef] }
        ),
      removeFromContext: (trialRef) =>
        set((state) => ({
          contextTrialRefs: state.contextTrialRefs.filter((ref) => ref !== trialRef),
        })),
      clearContext: () => set({ contextTrialRefs: [] }),
      toggleBookmark: (trialRef) =>
        set((state) => ({
          bookmarkedTrialRefs: state.bookmarkedTrialRefs.includes(trialRef)
            ? state.bookmarkedTrialRefs.filter((ref) => ref !== trialRef)
            : [...state.bookmarkedTrialRefs, trialRef],
        })),
      removeBookmark: (trialRef) =>
        set((state) => ({
          bookmarkedTrialRefs: state.bookmarkedTrialRefs.filter((ref) => ref !== trialRef),
        })),
      addBookmarkTrial: (trial) =>
        set((state) => {
          const trialRef = trial.trialRef;
          if (!trialRef) return state;
          // Already on the map from a chat turn: leave its provenance alone.
          if (state.trials.some((candidate) => candidate.trialRef === trialRef)) return state;
          return {
            trials: [...state.trials, trial],
            bookmarkTrialRefs: [...state.bookmarkTrialRefs, trialRef],
          };
        }),
      dropBookmarkTrial: (trialRef) =>
        set((state) => {
          if (!state.bookmarkTrialRefs.includes(trialRef)) return state;
          const wasSelected = state.selectedTrialRef === trialRef;
          return {
            trials: state.trials.filter((trial) => trial.trialRef !== trialRef),
            bookmarkTrialRefs: state.bookmarkTrialRefs.filter((ref) => ref !== trialRef),
            selectedTrialRef: wasSelected ? null : state.selectedTrialRef,
            selectedSiteKey: wasSelected ? null : state.selectedSiteKey,
          };
        }),
      reset: () =>
        set({
          trials: [],
          selectedTrialRef: null,
          selectedSiteKey: null,
          contextTrialRefs: [],
          bookmarkTrialRefs: [],
          tourMessages: [],
        }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      markLanguageChosen: () => set({ hasChosenLanguage: true }),
      markTourSeen: () => set({ hasSeenTour: true }),
      setTourMessages: (tourMessages) => set({ tourMessages }),
    }),
    {
      name: 'ctc-app',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        hasChosenLanguage: state.hasChosenLanguage,
        hasSeenTour: state.hasSeenTour,
        bookmarkedTrialRefs: state.bookmarkedTrialRefs,
      }),
    }
  )
);
