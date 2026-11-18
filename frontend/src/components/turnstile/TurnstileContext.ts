import { createContext, useContext } from 'react';

export interface TurnstileContextValue {
  token: string | null;
  verificationId: string;
}

const DISABLED: TurnstileContextValue = { token: null, verificationId: '' };

export const TurnstileContext = createContext<TurnstileContextValue | null>(null);

export function useTurnstile(): TurnstileContextValue {
  return useContext(TurnstileContext) ?? DISABLED;
}
