import { createContext, useContext } from 'react';

export interface TurnstileContextValue {
  enabled: boolean;
  ready: boolean;
  token: string | null;
  reset: () => void;
}

const DISABLED: TurnstileContextValue = {
  enabled: false,
  ready: true,
  token: null,
  reset: () => {},
};

export const TurnstileContext = createContext<TurnstileContextValue | null>(null);

export function useTurnstile(): TurnstileContextValue {
  return useContext(TurnstileContext) ?? DISABLED;
}
