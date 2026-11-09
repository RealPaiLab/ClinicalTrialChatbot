// Mirrors backend schemas/source.py SourceCode; `label` (the badge) and `registry` (the link target) are untranslated names.
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
