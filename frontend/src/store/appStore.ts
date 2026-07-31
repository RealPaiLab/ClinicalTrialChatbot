import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage, Trial } from '@/types/trial';

export type Theme = 'light' | 'dark';

interface AppState {
  trials: Trial[];
  selectedNctNumber: string | null;
  selectedSiteKey: string | null;
  contextNctNumbers: string[];
  bookmarkedNctNumbers: string[];
  /** Trials put on the map from the saved list rather than by a chat turn. */
  bookmarkTrialNctNumbers: string[];
  theme: Theme;
  hasSeenTour: boolean;
  tourMessages: ChatMessage[];

  setTrials: (trials: Trial[]) => void;
  selectTrial: (nctNumber: string | null, siteKey?: string | null) => void;
  addToContext: (nctNumber: string) => void;
  removeFromContext: (nctNumber: string) => void;
  clearContext: () => void;
  toggleBookmark: (nctNumber: string) => void;
  removeBookmark: (nctNumber: string) => void;
  addBookmarkTrial: (trial: Trial) => void;
  dropBookmarkTrial: (nctNumber: string) => void;
  reset: () => void;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  markTourSeen: () => void;
  setTourMessages: (messages: ChatMessage[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      trials: [],
      selectedNctNumber: null,
      selectedSiteKey: null,
      contextNctNumbers: [],
      bookmarkedNctNumbers: [],
      bookmarkTrialNctNumbers: [],
      theme: 'light',
      hasSeenTour: false,
      tourMessages: [],

      // A chat turn owns the map: whatever a bookmark added is superseded by it.
      setTrials: (trials) => set({ trials, bookmarkTrialNctNumbers: [] }),
      selectTrial: (selectedNctNumber, selectedSiteKey = null) =>
        set({ selectedNctNumber, selectedSiteKey }),
      addToContext: (nctNumber) =>
        set((state) =>
          state.contextNctNumbers.includes(nctNumber)
            ? state
            : { contextNctNumbers: [...state.contextNctNumbers, nctNumber] }
        ),
      removeFromContext: (nctNumber) =>
        set((state) => ({
          contextNctNumbers: state.contextNctNumbers.filter((nct) => nct !== nctNumber),
        })),
      clearContext: () => set({ contextNctNumbers: [] }),
      toggleBookmark: (nctNumber) =>
        set((state) => ({
          bookmarkedNctNumbers: state.bookmarkedNctNumbers.includes(nctNumber)
            ? state.bookmarkedNctNumbers.filter((nct) => nct !== nctNumber)
            : [...state.bookmarkedNctNumbers, nctNumber],
        })),
      removeBookmark: (nctNumber) =>
        set((state) => ({
          bookmarkedNctNumbers: state.bookmarkedNctNumbers.filter((nct) => nct !== nctNumber),
        })),
      addBookmarkTrial: (trial) =>
        set((state) => {
          const nctNumber = trial.nctNumber;
          if (!nctNumber) return state;
          // Already on the map from a chat turn: leave its provenance alone.
          if (state.trials.some((candidate) => candidate.nctNumber === nctNumber)) return state;
          return {
            trials: [...state.trials, trial],
            bookmarkTrialNctNumbers: [...state.bookmarkTrialNctNumbers, nctNumber],
          };
        }),
      dropBookmarkTrial: (nctNumber) =>
        set((state) => {
          if (!state.bookmarkTrialNctNumbers.includes(nctNumber)) return state;
          const wasSelected = state.selectedNctNumber === nctNumber;
          return {
            trials: state.trials.filter((trial) => trial.nctNumber !== nctNumber),
            bookmarkTrialNctNumbers: state.bookmarkTrialNctNumbers.filter(
              (nct) => nct !== nctNumber
            ),
            selectedNctNumber: wasSelected ? null : state.selectedNctNumber,
            selectedSiteKey: wasSelected ? null : state.selectedSiteKey,
          };
        }),
      reset: () =>
        set({
          trials: [],
          selectedNctNumber: null,
          selectedSiteKey: null,
          contextNctNumbers: [],
          bookmarkTrialNctNumbers: [],
          tourMessages: [],
        }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (theme) => set({ theme }),
      markTourSeen: () => set({ hasSeenTour: true }),
      setTourMessages: (tourMessages) => set({ tourMessages }),
    }),
    {
      name: 'ctc-app',
      partialize: (state) => ({
        theme: state.theme,
        hasSeenTour: state.hasSeenTour,
        bookmarkedNctNumbers: state.bookmarkedNctNumbers,
      }),
    }
  )
);
