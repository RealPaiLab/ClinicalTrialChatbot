export const PDF_DATA_DATE_LOCALE = 'en-GB';

const LOCALE_OVERRIDES: Record<string, string> = { en: PDF_DATA_DATE_LOCALE };

export function formatDataDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat([LOCALE_OVERRIDES[locale] ?? locale, PDF_DATA_DATE_LOCALE], {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}
