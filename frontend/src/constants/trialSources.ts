// One entry per ingestion source (mirrors backend schemas/source.py SourceCode).
// `label` is the organisation behind the listing (the badge), `registry` the site
// the outbound link opens; both are names, so they are not translated.
// `href` builds the registry's public trial page from the key the backend stores.
export const TRIAL_SOURCES = {
  ctc: {
    label: 'Q-CROC',
    registry: 'Cancer Trials Canada',
    badgeClass: 'border-primary/40 bg-primary/10 text-primary',
    href: (key: string) => `https://www.cancertrialscanada.ca/trial/${encodeURIComponent(key)}`,
  },
  ulc: {
    label: 'U-Link',
    registry: 'U-Link',
    badgeClass: 'border-active/70 bg-active/20 text-foreground',
    href: (key: string) => `https://u-link.care/trials?nid=${encodeURIComponent(key)}`,
  },
} as const;

export type TrialSourceCode = keyof typeof TRIAL_SOURCES;

export const TRIAL_SOURCE_CODES = Object.keys(TRIAL_SOURCES) as TrialSourceCode[];

export function isTrialSourceCode(value: string): value is TrialSourceCode {
  return value in TRIAL_SOURCES;
}
