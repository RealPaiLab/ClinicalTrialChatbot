import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage, Trial } from '@/types/trial';

export type Theme = 'light' | 'dark';

interface AppState {
  trials: Trial[];
  selectedNctNumber: string | null;
  selectedSiteKey: string | null;
  contextNctNumbers: string[];
  theme: Theme;
  hasSeenTour: boolean;
  tourMessages: ChatMessage[];

  setTrials: (trials: Trial[]) => void;
  selectTrial: (nctNumber: string | null, siteKey?: string | null) => void;
  addToContext: (nctNumber: string) => void;
  removeFromContext: (nctNumber: string) => void;
  clearContext: () => void;
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
      theme: 'light',
      hasSeenTour: false,
      tourMessages: [],

      setTrials: (trials) => set({ trials }),
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
      reset: () =>
        set({
          trials: [],
          selectedNctNumber: null,
          selectedSiteKey: null,
          contextNctNumbers: [],
          tourMessages: [],
        }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (theme) => set({ theme }),
      markTourSeen: () => set({ hasSeenTour: true }),
      setTourMessages: (tourMessages) => set({ tourMessages }),
    }),
    {
      name: 'ctc-app',
      partialize: (state) => ({ theme: state.theme, hasSeenTour: state.hasSeenTour }),
    }
  )
);
