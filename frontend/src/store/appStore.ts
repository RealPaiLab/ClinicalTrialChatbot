import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LanguageCode } from '@/constants/language';
import type { SheetSnap } from '@/constants/layout';
import type { ChatMessage, ResultTurn, Trial } from '@/types/trial';

export type Theme = 'light' | 'dark';

/** What the map, selection and chat context show: the part a tour swaps out and restores. */
interface Workspace {
  trials: Trial[];
  /** Trials on the map that the latest chat turn did not return (opened from bookmarks or kept in context). */
  pinnedTrialRefs: string[];
  contextTrialRefs: string[];
  selectedTrialRef: string | null;
  selectedSiteKey: string | null;
  /** Every answer that returned trials, oldest first. */
  resultTurns: ResultTurn[];
  /** The answer whose trials the map shows; null once something else replaced them. */
  shownTurnId: string | null;
  /** Mobile chat sheet height; kept here so the tour can move it. */
  sheetSnap: SheetSnap;
}

interface Tour {
  messages: ChatMessage[];
  saved: Workspace;
}

interface AppState extends Workspace {
  bookmarkedTrialRefs: string[];
  theme: Theme;
  language: LanguageCode;
  hasChosenLanguage: boolean;
  hasSeenTour: boolean;
  tour: Tour | null;
  conversationTitle: string | null;
  /** Mobile trial details drawer; kept here so the tour can open it. */
  trialDrawerOpen: boolean;

  setTrials: (trials: Trial[]) => void;
  showTurn: (turn: ResultTurn) => void;
  setConversationTitle: (conversationTitle: string | null) => void;
  setSheetSnap: (sheetSnap: SheetSnap) => void;
  setTrialDrawerOpen: (trialDrawerOpen: boolean) => void;
  selectTrial: (trialRef: string | null, siteKey?: string | null) => void;
  addToContext: (trialRef: string) => void;
  removeFromContext: (trialRef: string) => void;
  openTrial: (trial: Trial) => void;
  toggleBookmark: (trialRef: string) => void;
  removeBookmark: (trialRef: string) => void;
  reset: () => void;
  toggleTheme: () => void;
  setLanguage: (language: LanguageCode) => void;
  markLanguageChosen: () => void;
  startTour: (messages: ChatMessage[]) => void;
  endTour: () => void;
}

const without = (refs: string[], trialRef: string) => refs.filter((ref) => ref !== trialRef);

// A set of results owns the map, except trials still in the chat context: they stay pinned until removed.
function placeTrials(state: AppState, trials: Trial[]): Partial<AppState> {
  const returned = new Set(trials.map((trial) => trial.trialRef));
  const kept = state.trials.filter(
    (trial) => state.contextTrialRefs.includes(trial.trialRef) && !returned.has(trial.trialRef)
  );
  const next = [...trials, ...kept];
  const stillShown = next.some((trial) => trial.trialRef === state.selectedTrialRef);
  return {
    trials: next,
    pinnedTrialRefs: kept.map((trial) => trial.trialRef),
    selectedTrialRef: stillShown ? state.selectedTrialRef : null,
    selectedSiteKey: stillShown ? state.selectedSiteKey : null,
  };
}

export const selectIsTourRunning = (state: AppState) => state.tour !== null;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      trials: [],
      pinnedTrialRefs: [],
      contextTrialRefs: [],
      selectedTrialRef: null,
      selectedSiteKey: null,
      resultTurns: [],
      shownTurnId: null,
      // A fresh phone visit opens on the map; the search bar or peek bar opens the chat.
      sheetSnap: 'peek',
      bookmarkedTrialRefs: [],
      theme: 'light',
      language: LanguageCode.En,
      hasChosenLanguage: false,
      hasSeenTour: false,
      tour: null,
      conversationTitle: null,
      trialDrawerOpen: false,

      setTrials: (trials) => set((state) => ({ ...placeTrials(state, trials), shownTurnId: null })),
      // Records an answer the first time it is shown, so a new answer and a revisited one take the same path.
      showTurn: (turn) =>
        set((state) => ({
          ...placeTrials(state, turn.trials),
          shownTurnId: turn.id,
          resultTurns: state.resultTurns.some((known) => known.id === turn.id)
            ? state.resultTurns
            : [...state.resultTurns, turn],
        })),
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
      // A pinned trial leaves the map with its context chip: no chat turn keeps it there.
      removeFromContext: (trialRef) =>
        set((state) => {
          const contextTrialRefs = without(state.contextTrialRefs, trialRef);
          if (!state.pinnedTrialRefs.includes(trialRef)) return { contextTrialRefs };
          const wasSelected = state.selectedTrialRef === trialRef;
          return {
            contextTrialRefs,
            trials: state.trials.filter((trial) => trial.trialRef !== trialRef),
            pinnedTrialRefs: without(state.pinnedTrialRefs, trialRef),
            selectedTrialRef: wasSelected ? null : state.selectedTrialRef,
            selectedSiteKey: wasSelected ? null : state.selectedSiteKey,
          };
        }),
      // A bookmark can outlive the conversation that surfaced it, so opening one puts it back on the map.
      openTrial: (trial) =>
        set((state) => {
          const onMap = state.trials.some((candidate) => candidate.trialRef === trial.trialRef);
          return {
            ...(onMap
              ? {}
              : {
                  trials: [...state.trials, trial],
                  pinnedTrialRefs: [...state.pinnedTrialRefs, trial.trialRef],
                }),
            selectedTrialRef: trial.trialRef,
            selectedSiteKey: null,
            contextTrialRefs: state.contextTrialRefs.includes(trial.trialRef)
              ? state.contextTrialRefs
              : [...state.contextTrialRefs, trial.trialRef],
          };
        }),
      toggleBookmark: (trialRef) =>
        set((state) => ({
          bookmarkedTrialRefs: state.bookmarkedTrialRefs.includes(trialRef)
            ? without(state.bookmarkedTrialRefs, trialRef)
            : [...state.bookmarkedTrialRefs, trialRef],
        })),
      removeBookmark: (trialRef) =>
        set((state) => ({ bookmarkedTrialRefs: without(state.bookmarkedTrialRefs, trialRef) })),
      reset: () =>
        set({
          trials: [],
          selectedTrialRef: null,
          selectedSiteKey: null,
          contextTrialRefs: [],
          pinnedTrialRefs: [],
          resultTurns: [],
          shownTurnId: null,
          conversationTitle: null,
        }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setLanguage: (language) => set({ language }),
      markLanguageChosen: () => set({ hasChosenLanguage: true }),
      // Context and history are cleared so the patient's own results stay off the demo map.
      startTour: (messages) =>
        set((state) => ({
          tour: {
            messages,
            saved: {
              trials: state.trials,
              pinnedTrialRefs: state.pinnedTrialRefs,
              contextTrialRefs: state.contextTrialRefs,
              selectedTrialRef: state.selectedTrialRef,
              selectedSiteKey: state.selectedSiteKey,
              resultTurns: state.resultTurns,
              shownTurnId: state.shownTurnId,
              sheetSnap: state.sheetSnap,
            },
          },
          contextTrialRefs: [],
          resultTurns: [],
          shownTurnId: null,
        })),
      endTour: () =>
        set((state) =>
          state.tour
            ? { ...state.tour.saved, tour: null, trialDrawerOpen: false, hasSeenTour: true }
            : { hasSeenTour: true }
        ),
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
