import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LanguageCode } from '@/constants/language';
import type { SheetSnap } from '@/constants/layout';
import type { ChatMessage, Trial } from '@/types/trial';

export type Theme = 'light' | 'dark';

interface AppState {
  trials: Trial[];
  selectedTrialRef: string | null;
  selectedSiteKey: string | null;
  contextTrialRefs: string[];
  bookmarkedTrialRefs: string[];
  /** Trials on the map that the latest chat turn did not return (opened from bookmarks or kept in context). */
  pinnedTrialRefs: string[];
  theme: Theme;
  language: LanguageCode;
  hasChosenLanguage: boolean;
  hasSeenTour: boolean;
  tourMessages: ChatMessage[];
  conversationTitle: string | null;
  /** Mobile chat sheet height; kept here so the tour can move it. */
  sheetSnap: SheetSnap;
  /** Mobile trial details drawer; kept here so the tour can open it. */
  trialDrawerOpen: boolean;

  setTrials: (trials: Trial[]) => void;
  setConversationTitle: (conversationTitle: string | null) => void;
  setSheetSnap: (sheetSnap: SheetSnap) => void;
  setTrialDrawerOpen: (trialDrawerOpen: boolean) => void;
  selectTrial: (trialRef: string | null, siteKey?: string | null) => void;
  addToContext: (trialRef: string) => void;
  removeFromContext: (trialRef: string) => void;
  clearContext: () => void;
  toggleBookmark: (trialRef: string) => void;
  removeBookmark: (trialRef: string) => void;
  pinTrial: (trial: Trial) => void;
  unpinTrial: (trialRef: string) => void;
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
      pinnedTrialRefs: [],
      theme: 'light',
      language: LanguageCode.En,
      hasChosenLanguage: false,
      hasSeenTour: false,
      tourMessages: [],
      conversationTitle: null,
      // A fresh phone visit opens on the map; the search bar or peek bar opens the chat.
      sheetSnap: 'peek',
      trialDrawerOpen: false,

      // A chat turn owns the map, except trials still in the chat context: they stay pinned until removed.
      setTrials: (trials) =>
        set((state) => {
          const returned = new Set(trials.map((trial) => trial.trialRef));
          const kept = state.trials.filter(
            (trial) =>
              state.contextTrialRefs.includes(trial.trialRef) && !returned.has(trial.trialRef)
          );
          return {
            trials: [...trials, ...kept],
            pinnedTrialRefs: kept.map((trial) => trial.trialRef),
          };
        }),
      setConversationTitle: (conversationTitle) => set({ conversationTitle }),
      setSheetSnap: (sheetSnap) => set({ sheetSnap }),
      setTrialDrawerOpen: (trialDrawerOpen) => set({ trialDrawerOpen }),
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
      pinTrial: (trial) =>
        set((state) => {
          const trialRef = trial.trialRef;
          if (!trialRef) return state;
          // Already on the map from a chat turn: leave its provenance alone.
          if (state.trials.some((candidate) => candidate.trialRef === trialRef)) return state;
          return {
            trials: [...state.trials, trial],
            pinnedTrialRefs: [...state.pinnedTrialRefs, trialRef],
          };
        }),
      unpinTrial: (trialRef) =>
        set((state) => {
          if (!state.pinnedTrialRefs.includes(trialRef)) return state;
          const wasSelected = state.selectedTrialRef === trialRef;
          return {
            trials: state.trials.filter((trial) => trial.trialRef !== trialRef),
            pinnedTrialRefs: state.pinnedTrialRefs.filter((ref) => ref !== trialRef),
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
          pinnedTrialRefs: [],
          tourMessages: [],
          conversationTitle: null,
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
