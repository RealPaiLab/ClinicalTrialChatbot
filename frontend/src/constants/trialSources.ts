// One entry per ingestion source (mirrors backend schemas/source.py SourceCode).
// `href` builds the registry's public trial page from the key the backend stores.
export const TRIAL_SOURCES = {
  ctc: {
    labelKey: 'sources.ctc.label',
    registryKey: 'sources.ctc.registry',
    badgeClass: 'border-primary/40 bg-primary/10 text-primary',
    href: (key: string) => `https://www.cancertrialscanada.ca/trial/${encodeURIComponent(key)}`,
  },
  ulc: {
    labelKey: 'sources.ulc.label',
    registryKey: 'sources.ulc.registry',
    badgeClass: 'border-active/70 bg-active/20 text-foreground',
    href: (key: string) => `https://u-link.care/trials?nid=${encodeURIComponent(key)}`,
  },
} as const;

export type TrialSourceCode = keyof typeof TRIAL_SOURCES;

export const TRIAL_SOURCE_CODES = Object.keys(TRIAL_SOURCES) as TrialSourceCode[];

export function isTrialSourceCode(value: string): value is TrialSourceCode {
  return value in TRIAL_SOURCES;
}
