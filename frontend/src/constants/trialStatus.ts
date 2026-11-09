// Key order is display priority: a trial whose sites disagree shows the first status present.
export const TRIAL_STATUS = {
  recruiting: {
    labelKey: 'status.recruiting',
    colorClass: 'text-recruiting',
    badgeClass: 'bg-recruiting',
    pulse: true,
  },
  opening_soon: {
    labelKey: 'status.openingSoon',
    colorClass: 'text-active',
    badgeClass: 'bg-active',
    pulse: false,
  },
} as const;

export type TrialStatus = keyof typeof TRIAL_STATUS;

export const TRIAL_STATUSES = Object.keys(TRIAL_STATUS) as TrialStatus[];
