// English renders day-first ("2 Sept 2026"), in the app and in the PDF alike.
const LOCALE_OVERRIDES: Record<string, string> = { en: 'en-GB' };

export function formatDataDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat([LOCALE_OVERRIDES[locale] ?? locale, 'en-GB'], {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}
