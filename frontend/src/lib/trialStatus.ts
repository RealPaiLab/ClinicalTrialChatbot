import type { TrialStatus } from '@/types/trial';

interface TrialStatusConfig {
  label: string;
  labelKey: string;
  colorClass: string;
  badgeClass: string;
  pulse: boolean;
}

export const TRIAL_STATUS = {
  recruiting: {
    label: 'Recruiting',
    labelKey: 'status.recruiting',
    colorClass: 'text-recruiting',
    badgeClass: 'bg-recruiting',
    pulse: true,
  },
  opening_soon: {
    label: 'Opening soon',
    labelKey: 'status.openingSoon',
    colorClass: 'text-active',
    badgeClass: 'bg-active',
    pulse: false,
  },
} as const satisfies Record<TrialStatus, TrialStatusConfig>;

export function normalizeStatus(state: string | null | undefined): TrialStatus | null {
  if (!state) return null;
  const value = state.toLowerCase();
  if (value.includes('not yet') || value.includes('opening')) return 'opening_soon';
  if (value.includes('recruit')) return 'recruiting';
  return null;
}
