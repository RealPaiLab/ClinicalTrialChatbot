const STORAGE_KEY = 'ctc.termsConsent';

/** Bump when the Terms of Use text changes so testers are asked to agree again. */
export const TERMS_VERSION = '2026-07-16';

export function hasConsented(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === TERMS_VERSION;
  } catch {
    return false;
  }
}

export function recordConsent(): void {
  try {
    localStorage.setItem(STORAGE_KEY, TERMS_VERSION);
  } catch {
    // A blocked localStorage only costs the user a re-prompt next visit.
  }
}
